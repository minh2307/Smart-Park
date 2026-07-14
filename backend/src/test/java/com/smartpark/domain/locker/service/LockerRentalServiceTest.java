package com.smartpark.domain.locker.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.locker.dto.LockerRentalRequestDto;
import com.smartpark.domain.locker.dto.LockerRentalResponseDto;
import com.smartpark.domain.locker.dto.LockerRentalReturnDto;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.repository.LockerRepository;
import com.smartpark.domain.locker.repository.LockerTransactionRepository;
import com.smartpark.domain.locker.service.impl.LockerRentalServiceImpl;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LockerRentalServiceTest {

    @Mock
    private LockerRepository lockerRepository;

    @Mock
    private LockerTransactionRepository lockerTransactionRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private LockerRentalServiceImpl lockerRentalService;

    private Locker locker;
    private Customer customer;
    private User user;
    private LockerTransaction rental;

    @BeforeEach
    void setUp() {
        locker = Locker.builder()
                .id(1L)
                .lockerCode("L-001")
                .status(Locker.LockerStatus.AVAILABLE)
                .currentAvailability(true)
                .rentalPrice(BigDecimal.valueOf(5000))
                .build();

        customer = Customer.builder()
                .id(10L)
                .fullName("John Doe")
                .status(Customer.CustomerStatus.ACTIVE)
                .build();

        user = User.builder()
                .id(100L)
                .username("john_doe")
                .build();

        rental = LockerTransaction.builder()
                .id(50L)
                .locker(locker)
                .customer(customer)
                .startTime(LocalDateTime.now().minusHours(2))
                .status(LockerTransaction.LockerTransactionStatus.ACTIVE)
                .build();
    }

    @Test
    void findAllRentals_ShouldReturnPageOfRentals() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<LockerTransaction> page = new PageImpl<>(List.of(rental));
        when(lockerTransactionRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<LockerRentalResponseDto> result = lockerRentalService.findAllRentals("John", LockerTransaction.LockerTransactionStatus.ACTIVE, pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void findRentalById_ShouldReturnRentalResponseDto_WhenExists() {
        when(lockerTransactionRepository.findById(50L)).thenReturn(Optional.of(rental));

        LockerRentalResponseDto result = lockerRentalService.findRentalById(50L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(50L);
    }

    @Test
    void findRentalById_ShouldThrowResourceNotFoundException_WhenNotExists() {
        when(lockerTransactionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lockerRentalService.findRentalById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void rentLocker_ShouldCreateRental_WhenCustomerIdProvidedAndValid() {
        LockerRentalRequestDto dto = LockerRentalRequestDto.builder()
                .lockerId(1L)
                .customerId(10L)
                .deposit(BigDecimal.valueOf(20000))
                .build();

        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));
        when(customerRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(lockerTransactionRepository.count(any(Specification.class))).thenReturn(0L);
        when(lockerTransactionRepository.save(any(LockerTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LockerRentalResponseDto result = lockerRentalService.rentLocker(dto);

        assertThat(result).isNotNull();
        assertThat(locker.getStatus()).isEqualTo(Locker.LockerStatus.OCCUPIED);
        assertThat(locker.getCurrentAvailability()).isFalse();
    }

    @Test
    void rentLocker_ShouldCreateRental_WhenCustomerNameProvidedAndNotFound() {
        LockerRentalRequestDto dto = LockerRentalRequestDto.builder()
                .lockerId(1L)
                .customerName("Jane Doe")
                .deposit(BigDecimal.valueOf(20000))
                .build();

        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));
        when(customerRepository.findByFullName("Jane Doe")).thenReturn(List.of());
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(lockerTransactionRepository.count(any(Specification.class))).thenReturn(0L);
        when(lockerTransactionRepository.save(any(LockerTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LockerRentalResponseDto result = lockerRentalService.rentLocker(dto);

        assertThat(result).isNotNull();
    }

    @Test
    void rentLocker_ShouldThrowBusinessException_WhenLockerNotAvailable() {
        locker.setStatus(Locker.LockerStatus.OCCUPIED);
        locker.setCurrentAvailability(false);

        LockerRentalRequestDto dto = LockerRentalRequestDto.builder()
                .lockerId(1L)
                .customerId(10L)
                .build();

        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));

        assertThatThrownBy(() -> lockerRentalService.rentLocker(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("không ở trạng thái sẵn sàng");
    }

    @Test
    void rentLocker_ShouldThrowBusinessException_WhenActiveRentalsLimitExceeded() {
        LockerRentalRequestDto dto = LockerRentalRequestDto.builder()
                .lockerId(1L)
                .customerId(10L)
                .build();

        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));
        when(customerRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(lockerTransactionRepository.count(any(Specification.class))).thenReturn(3L); // Limit is 3

        assertThatThrownBy(() -> lockerRentalService.rentLocker(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("vượt quá số lượng tủ đồ được thuê tối đa");
    }

    @Test
    void returnLocker_ShouldCompleteRentalAndTriggerOrderService() {
        LockerRentalReturnDto dto = LockerRentalReturnDto.builder()
                .rentalId(50L)
                .penalty(BigDecimal.valueOf(1000))
                .damageFee(BigDecimal.valueOf(2000))
                .build();

        Order order = new Order();
        order.setOrderCode("ORDER-12345");

        when(lockerTransactionRepository.findById(50L)).thenReturn(Optional.of(rental));
        when(lockerTransactionRepository.save(any(LockerTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderService.createOrder(eq(10L), any(), anyList())).thenReturn(order);

        LockerRentalResponseDto result = lockerRentalService.returnLocker(dto);

        assertThat(result).isNotNull();
        assertThat(rental.getStatus()).isEqualTo(LockerTransaction.LockerTransactionStatus.COMPLETED);
        assertThat(rental.getPaymentStatus()).isEqualTo("PAID");
        assertThat(locker.getStatus()).isEqualTo(Locker.LockerStatus.AVAILABLE);
        assertThat(locker.getCurrentAvailability()).isTrue();

        verify(orderService).createOrder(eq(10L), any(), anyList());
        verify(orderService).confirmPayment("ORDER-12345");
    }

    @Test
    void returnLocker_ShouldNotRollback_WhenOrderServiceFails() {
        LockerRentalReturnDto dto = LockerRentalReturnDto.builder()
                .rentalId(50L)
                .build();

        when(lockerTransactionRepository.findById(50L)).thenReturn(Optional.of(rental));
        when(lockerTransactionRepository.save(any(LockerTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderService.createOrder(eq(10L), any(), anyList())).thenThrow(new RuntimeException("Order System Down"));

        LockerRentalResponseDto result = lockerRentalService.returnLocker(dto);

        assertThat(result).isNotNull();
        assertThat(rental.getStatus()).isEqualTo(LockerTransaction.LockerTransactionStatus.COMPLETED);
        assertThat(rental.getPaymentStatus()).isEqualTo("PENDING"); // Stays pending since order failed
        assertThat(locker.getStatus()).isEqualTo(Locker.LockerStatus.AVAILABLE);
    }

    @Test
    void returnLocker_ShouldThrowBusinessException_WhenRentalNotActive() {
        rental.setStatus(LockerTransaction.LockerTransactionStatus.COMPLETED);
        LockerRentalReturnDto dto = LockerRentalReturnDto.builder()
                .rentalId(50L)
                .build();

        when(lockerTransactionRepository.findById(50L)).thenReturn(Optional.of(rental));

        assertThatThrownBy(() -> lockerRentalService.returnLocker(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("không ở trạng thái hoạt động");
    }

    @Test
    void findCurrentRentals_ShouldReturnCurrentActiveRentals() {
        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(user));
        when(customerRepository.findByUserId(100L)).thenReturn(Optional.of(customer));
        when(lockerTransactionRepository.findAll(any(Specification.class))).thenReturn(List.of(rental));

        List<LockerRentalResponseDto> result = lockerRentalService.findCurrentRentals("john_doe");

        assertThat(result).hasSize(1);
    }

    @Test
    void findRentalHistory_ShouldReturnCompletedRentalsPage() {
        Pageable pageable = PageRequest.of(0, 10);
        rental.setStatus(LockerTransaction.LockerTransactionStatus.COMPLETED);
        Page<LockerTransaction> page = new PageImpl<>(List.of(rental));

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(user));
        when(customerRepository.findByUserId(100L)).thenReturn(Optional.of(customer));
        when(lockerTransactionRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<LockerRentalResponseDto> result = lockerRentalService.findRentalHistory("john_doe", pageable);

        assertThat(result.getContent()).hasSize(1);
    }
}
