package com.smartpark.domain.promotion.service;

import com.smartpark.domain.promotion.dto.VoucherRequestDto;
import com.smartpark.domain.promotion.dto.VoucherResponseDto;
import com.smartpark.domain.promotion.dto.VoucherRedeemRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface VoucherService {
    Page<VoucherResponseDto> findAll(String search, Long customerId, String status, Pageable pageable);
    VoucherResponseDto findById(Long id);
    VoucherResponseDto create(VoucherRequestDto request);
    VoucherResponseDto update(Long id, VoucherRequestDto request);
    void delete(Long id);
    VoucherResponseDto redeem(VoucherRedeemRequestDto request);
    BigDecimal validate(String code, Long customerId, BigDecimal orderTotal);
    VoucherResponseDto disable(Long id);
}
