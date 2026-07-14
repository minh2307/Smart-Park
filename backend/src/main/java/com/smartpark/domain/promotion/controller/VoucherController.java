package com.smartpark.domain.promotion.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.promotion.dto.VoucherRequestDto;
import com.smartpark.domain.promotion.dto.VoucherResponseDto;
import com.smartpark.domain.promotion.dto.VoucherRedeemRequestDto;
import com.smartpark.domain.promotion.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'FINANCE_MANAGER')")
    public ResponseEntity<ApiResponse<Page<VoucherResponseDto>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<VoucherResponseDto> vouchers = voucherService.findAll(search, customerId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(vouchers));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE')")
    public ResponseEntity<ApiResponse<VoucherResponseDto>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<VoucherResponseDto>> create(@Valid @RequestBody VoucherRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<VoucherResponseDto>> update(@PathVariable Long id, @Valid @RequestBody VoucherRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        voucherService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'CRM_MANAGER', 'FINANCE_MANAGER')")
    public ResponseEntity<ApiResponse<VoucherResponseDto>> redeem(@Valid @RequestBody VoucherRedeemRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.redeem(request)));
    }

    @GetMapping("/validate")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> validate(
            @RequestParam String code,
            @RequestParam Long customerId,
            @RequestParam BigDecimal orderTotal) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.validate(code, customerId, orderTotal)));
    }

    @PatchMapping("/{id}/disable")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'FINANCE_MANAGER')")
    public ResponseEntity<ApiResponse<VoucherResponseDto>> disable(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.disable(id)));
    }
}
