package com.smartpark.domain.locker.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.mapper.LockerMapper;
import com.smartpark.domain.locker.repository.LockerRepository;
import com.smartpark.domain.locker.repository.LockerTransactionRepository;
import com.smartpark.domain.locker.service.LockerRentalService;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.entity.OrderItem;
import com.smartpark.domain.order.service.OrderService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LockerRentalServiceImpl implements LockerRentalService {

    private final LockerRepository lockerRepository;
    private final LockerTransactionRepository lockerTransactionRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    @Override
    @Transactional(readOnly = true)
    public Page<LockerRentalResponseDto> findAllRentals(String search, LockerTransaction.LockerTransactionStatus status, Pageable pageable) {
        Specification<LockerTransaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("locker").get("lockerCode")), pattern),
                        cb.like(cb.lower(root.get("customer").get("fullName")), pattern)
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return lockerTransactionRepository.findAll(spec, pageable).map(LockerMapper::toRentalResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public LockerRentalResponseDto findRentalById(Long id) {
        LockerTransaction rental = lockerTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LockerTransaction", id));
        return LockerMapper.toRentalResponseDto(rental);
    }

    @Override
    @Transactional
    public LockerRentalResponseDto rentLocker(LockerRentalRequestDto dto) {
        Locker locker = lockerRepository.findById(dto.getLockerId())
                .orElseThrow(() -> new ResourceNotFoundException("Locker", dto.getLockerId()));

        if (locker.getStatus() != Locker.LockerStatus.AVAILABLE || !locker.getCurrentAvailability()) {
            throw new BusinessException("Tủ đồ không ở trạng thái sẵn sàng để thuê.");
        }

        Customer customer;
        if (dto.getCustomerId() != null) {
            customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", dto.getCustomerId()));
        } else {
            String name = (dto.getCustomerName() != null && !dto.getCustomerName().trim().isEmpty()) 
                    ? dto.getCustomerName().trim() 
                    : "Khách Hàng";
            List<Customer> list = customerRepository.findByFullName(name);
            if (!list.isEmpty()) {
                customer = list.get(0);
            } else {
                customer = Customer.builder()
                        .fullName(name)
                        .phone("09" + (System.currentTimeMillis() % 100000000L))
                        .status(Customer.CustomerStatus.ACTIVE)
                        .build();
                customer = customerRepository.save(customer);
            }
        }

        // Limit checking (max 3 active lockers per customer)
        final Customer targetCustomer = customer;
        long activeCount = lockerTransactionRepository.count((root, query, cb) -> cb.and(
                cb.equal(root.get("customer").get("id"), targetCustomer.getId()),
                cb.equal(root.get("status"), LockerTransaction.LockerTransactionStatus.ACTIVE)
        ));
        if (activeCount >= 3) {
            throw new BusinessException("Khách hàng đã vượt quá số lượng tủ đồ được thuê tối đa (3 tủ).");
        }

        LockerTransaction rental = LockerTransaction.builder()
                .locker(locker)
                .customer(customer)
                .startTime(LocalDateTime.now())
                .deposit(dto.getDeposit() != null ? dto.getDeposit() : BigDecimal.ZERO)
                .rentalFee(BigDecimal.ZERO)
                .amountPaid(BigDecimal.ZERO)
                .penaltyAmount(BigDecimal.ZERO)
                .status(LockerTransaction.LockerTransactionStatus.ACTIVE)
                .paymentStatus("PAID") // Deposit is usually paid upfront
                .build();

        locker.setStatus(Locker.LockerStatus.OCCUPIED);
        locker.setCurrentAvailability(false);
        lockerRepository.save(locker);

        LockerTransaction saved = lockerTransactionRepository.save(rental);
        return LockerMapper.toRentalResponseDto(saved);
    }

    @Override
    @Transactional
    public LockerRentalResponseDto returnLocker(LockerRentalReturnDto dto) {
        LockerTransaction rental = lockerTransactionRepository.findById(dto.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("LockerTransaction", dto.getRentalId()));

        if (rental.getStatus() != LockerTransaction.LockerTransactionStatus.ACTIVE) {
            throw new BusinessException("Giao dịch thuê tủ đồ này không ở trạng thái hoạt động.");
        }

        Locker locker = rental.getLocker();
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(rental.getStartTime(), now);
        long hours = duration.toHours();
        if (duration.toMinutes() % 60 > 0 || hours == 0) {
            hours += 1; // Round up to next hour
        }

        BigDecimal hourlyRate = locker.getRentalPrice();
        BigDecimal rentalFee = hourlyRate.multiply(BigDecimal.valueOf(hours));
        BigDecimal penalty = dto.getPenalty() != null ? dto.getPenalty() : BigDecimal.ZERO;
        BigDecimal damageFee = dto.getDamageFee() != null ? dto.getDamageFee() : BigDecimal.ZERO;
        BigDecimal penaltyTotal = penalty.add(damageFee);

        BigDecimal totalAmount = rentalFee.add(penaltyTotal);

        rental.setEndTime(now);
        rental.setRentalFee(rentalFee);
        rental.setPenaltyAmount(penaltyTotal);
        rental.setAmountPaid(totalAmount);
        rental.setStatus(LockerTransaction.LockerTransactionStatus.COMPLETED);
        rental.setPaymentStatus("PENDING");

        locker.setStatus(Locker.LockerStatus.AVAILABLE);
        locker.setCurrentAvailability(true);
        lockerRepository.save(locker);

        LockerTransaction saved = lockerTransactionRepository.save(rental);

        // Invoke OrderService to create order for rental payment
        try {
            OrderItem orderItem = OrderItem.builder()
                    .itemType("LOCKER")
                    .referenceId(saved.getId())
                    .quantity(1)
                    .unitPrice(totalAmount)
                    .totalPrice(totalAmount)
                    .build();

            Order order = orderService.createOrder(rental.getCustomer().getId(), null, List.of(orderItem));
            // Confirm the order payment immediately to complete the flow
            orderService.confirmPayment(order.getOrderCode());
            saved.setPaymentStatus("PAID");
            lockerTransactionRepository.save(saved);
        } catch (Exception e) {
            // Log but don't roll back locker return if order creation fails, to avoid locking customer out
            // System.err.println("Failed to create Order for Locker Rental return: " + e.getMessage());
        }

        return LockerMapper.toRentalResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LockerRentalResponseDto> findCurrentRentals(String username) {
        Long customerId = resolveCustomerId(username);
        Specification<LockerTransaction> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("customer").get("id"), customerId),
                cb.equal(root.get("status"), LockerTransaction.LockerTransactionStatus.ACTIVE)
        );
        return lockerTransactionRepository.findAll(spec).stream()
                .map(LockerMapper::toRentalResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LockerRentalResponseDto> findRentalHistory(String username, Pageable pageable) {
        Long customerId = resolveCustomerId(username);
        Specification<LockerTransaction> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("customer").get("id"), customerId),
                cb.equal(root.get("status"), LockerTransaction.LockerTransactionStatus.COMPLETED)
        );
        return lockerTransactionRepository.findAll(spec, pageable).map(LockerMapper::toRentalResponseDto);
    }

    private Long resolveCustomerId(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer for user", username));
        return customer.getId();
    }
}
