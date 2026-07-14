package com.smartpark.domain.promotion.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.promotion.dto.CouponRequestDto;
import com.smartpark.domain.promotion.dto.CouponResponseDto;
import com.smartpark.domain.promotion.entity.Coupon;
import com.smartpark.domain.promotion.mapper.PromotionMapper;
import com.smartpark.domain.promotion.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final PromotionService promotionService;
    private final PromotionMapper promotionMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<Page<CouponResponseDto>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long promotionId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<CouponResponseDto> page = promotionService.findAllCoupons(search, promotionId, status, pageable)
                .map(promotionMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE')")
    public ResponseEntity<ApiResponse<CouponResponseDto>> findById(@PathVariable Long id) {
        Coupon coupon = promotionService.findCouponById(id);
        return ResponseEntity.ok(ApiResponse.success(promotionMapper.toResponse(coupon)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<CouponResponseDto>> create(@Valid @RequestBody CouponRequestDto request) {
        Coupon coupon = promotionService.createCoupon(request);
        return ResponseEntity.ok(ApiResponse.success(promotionMapper.toResponse(coupon)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<CouponResponseDto>> update(@PathVariable Long id, @Valid @RequestBody CouponRequestDto request) {
        Coupon coupon = promotionService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success(promotionMapper.toResponse(coupon)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        promotionService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> validate(
            @RequestParam String code,
            @RequestParam Long customerId,
            @RequestParam BigDecimal orderTotal) {
        BigDecimal discount = promotionService.validateAndCalculateDiscount(code, customerId, orderTotal);
        return ResponseEntity.ok(ApiResponse.success(discount));
    }

    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> apply(
            @RequestParam String code,
            @RequestParam Long customerId,
            @RequestParam BigDecimal orderTotal,
            @RequestParam(required = false) Long bookingId) {
        // Validate first
        BigDecimal discount = promotionService.validateAndCalculateDiscount(code, customerId, orderTotal);
        if (bookingId != null) {
            promotionService.recordCouponUsage(code, customerId, bookingId);
        }
        return ResponseEntity.ok(ApiResponse.success(discount));
    }

    @PatchMapping("/{id}/disable")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<CouponResponseDto>> disable(@PathVariable Long id) {
        Coupon coupon = promotionService.disableCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(promotionMapper.toResponse(coupon)));
    }
}
