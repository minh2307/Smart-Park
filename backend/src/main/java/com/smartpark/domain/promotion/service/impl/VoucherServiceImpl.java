package com.smartpark.domain.promotion.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.promotion.dto.VoucherRequestDto;
import com.smartpark.domain.promotion.dto.VoucherResponseDto;
import com.smartpark.domain.promotion.dto.VoucherRedeemRequestDto;
import com.smartpark.domain.promotion.entity.Voucher;
import com.smartpark.domain.promotion.entity.VoucherUsage;
import com.smartpark.domain.promotion.mapper.PromotionMapper;
import com.smartpark.domain.promotion.repository.VoucherRepository;
import com.smartpark.domain.promotion.repository.VoucherUsageRepository;
import com.smartpark.domain.promotion.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final CustomerRepository customerRepository;
    private final PromotionMapper promotionMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherResponseDto> findAll(String search, Long customerId, String status, Pageable pageable) {
        Voucher.VoucherStatus voucherStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                voucherStatus = Voucher.VoucherStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }
        return voucherRepository.findAllWithFilters(search, customerId, voucherStatus, pageable)
                .map(promotionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponseDto findById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", id));
        return promotionMapper.toResponse(voucher);
    }

    @Override
    @Transactional
    public VoucherResponseDto create(VoucherRequestDto request) {
        log.info("[VOUCHER CREATE] code={}", request.getCode());
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new ConflictException("ERR-VOUCH-001", "Mã Voucher đã tồn tại: " + request.getCode());
        }
        if (request.getValidTo().isBefore(request.getValidFrom())) {
            throw new BusinessException("ERR-VOUCH-002", "Ngày hết hạn phải sau ngày bắt đầu.");
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));
        }

        Voucher voucher = promotionMapper.toEntity(request, customer);
        Voucher saved = voucherRepository.save(voucher);
        log.info("[VOUCHER CREATED] id={}", saved.getId());
        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VoucherResponseDto update(Long id, VoucherRequestDto request) {
        log.info("[VOUCHER UPDATE] id={}", id);
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", id));

        if (!voucher.getCode().equals(request.getCode()) && voucherRepository.existsByCode(request.getCode())) {
            throw new ConflictException("ERR-VOUCH-001", "Mã Voucher đã tồn tại: " + request.getCode());
        }
        if (request.getValidTo().isBefore(request.getValidFrom())) {
            throw new BusinessException("ERR-VOUCH-002", "Ngày hết hạn phải sau ngày bắt đầu.");
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));
        }

        promotionMapper.updateEntity(voucher, request, customer);
        Voucher saved = voucherRepository.save(voucher);
        log.info("[VOUCHER UPDATED] id={}", saved.getId());
        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("[VOUCHER DELETE] id={}", id);
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", id));
        voucher.setStatus(Voucher.VoucherStatus.DISABLED);
        voucherRepository.save(voucher);
        log.info("[VOUCHER DELETED] status set to DISABLED for id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal validate(String code, Long customerId, BigDecimal orderTotal) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", code));

        LocalDate today = LocalDate.now();
        if (voucher.getStatus() != Voucher.VoucherStatus.ACTIVE) {
            throw new BusinessException("ERR-VOUCH-003", "Voucher không ở trạng thái hoạt động: " + voucher.getStatus());
        }
        if (today.isBefore(voucher.getValidFrom()) || today.isAfter(voucher.getValidTo())) {
            throw new BusinessException("ERR-VOUCH-004", "Voucher đã hết hạn sử dụng.");
        }
        if (voucher.getCustomer() != null && !voucher.getCustomer().getId().equals(customerId)) {
            throw new BusinessException("ERR-VOUCH-005", "Voucher này không thuộc về khách hàng này.");
        }
        if (voucher.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("ERR-VOUCH-006", "Voucher đã hết số dư.");
        }

        // Return the amount that can actually be used (min of remaining balance and order total)
        return voucher.getRemainingBalance().min(orderTotal);
    }

    @Override
    @Transactional
    public VoucherResponseDto redeem(VoucherRedeemRequestDto request) {
        log.info("[VOUCHER REDEEM] code={}, amount={}", request.getCode(), request.getRedeemAmount());
        Voucher voucher = voucherRepository.findByCode(request.getCode())
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", request.getCode()));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        BigDecimal applicableAmount = validate(request.getCode(), request.getCustomerId(), request.getRedeemAmount());
        if (request.getRedeemAmount().compareTo(applicableAmount) > 0) {
            throw new BusinessException("ERR-VOUCH-007", "Số tiền thanh toán vượt quá số dư tối đa có thể áp dụng.");
        }

        voucher.setRemainingBalance(voucher.getRemainingBalance().subtract(applicableAmount));
        if (voucher.getRemainingBalance().compareTo(BigDecimal.ZERO) == 0) {
            voucher.setStatus(Voucher.VoucherStatus.EXHAUSTED);
        }

        Voucher savedVoucher = voucherRepository.save(voucher);

        VoucherUsage usage = VoucherUsage.builder()
                .voucher(savedVoucher)
                .customer(customer)
                .bookingId(request.getBookingId())
                .amountUsed(applicableAmount)
                .build();
        voucherUsageRepository.save(usage);

        log.info("[VOUCHER REDEEMED] voucherId={}, usageId={}", savedVoucher.getId(), usage.getId());
        return promotionMapper.toResponse(savedVoucher);
    }

    @Override
    @Transactional
    public VoucherResponseDto disable(Long id) {
        log.info("[VOUCHER DISABLE] id={}", id);
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", id));
        voucher.setStatus(Voucher.VoucherStatus.DISABLED);
        Voucher saved = voucherRepository.save(voucher);
        return promotionMapper.toResponse(saved);
    }
}
