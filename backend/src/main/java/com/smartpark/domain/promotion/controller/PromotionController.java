package com.smartpark.domain.promotion.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.promotion.dto.PromotionRequestDto;
import com.smartpark.domain.promotion.dto.PromotionResponseDto;
import com.smartpark.domain.promotion.dto.PromotionValidateRequestDto;
import com.smartpark.domain.promotion.entity.Promotion;
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
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;
    private final PromotionMapper promotionMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<Page<PromotionResponseDto>>> findAllPromotions(
            @RequestParam(required = false) Long campaignId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String discountType,
            Pageable pageable) {
        Page<PromotionResponseDto> page = promotionService.findAllPromotions(campaignId, search, status, discountType, pageable)
                .map(promotionMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<PromotionResponseDto>> findById(@PathVariable Long id) {
        Promotion promotion = promotionService.findPromotionById(id);
        return ResponseEntity.ok(ApiResponse.success(promotionMapper.toResponse(promotion)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<PromotionResponseDto>> createPromotion(@Valid @RequestBody PromotionRequestDto request) {
        Promotion promotion = promotionService.createPromotion(request);
        return ResponseEntity.ok(ApiResponse.success(promotionMapper.toResponse(promotion)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<PromotionResponseDto>> updatePromotion(@PathVariable Long id, @Valid @RequestBody PromotionRequestDto request) {
        Promotion promotion = promotionService.updatePromotion(id, request);
        return ResponseEntity.ok(ApiResponse.success(promotionMapper.toResponse(promotion)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<PromotionResponseDto>> activatePromotion(@PathVariable Long id) {
        Promotion promotion = promotionService.activatePromotion(id);
        return ResponseEntity.ok(ApiResponse.success(promotionMapper.toResponse(promotion)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<PromotionResponseDto>> deactivatePromotion(@PathVariable Long id) {
        Promotion promotion = promotionService.deactivatePromotion(id);
        return ResponseEntity.ok(ApiResponse.success(promotionMapper.toResponse(promotion)));
    }

    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> validatePromotion(@Valid @RequestBody PromotionValidateRequestDto request) {
        BigDecimal discount = promotionService.validateAndCalculatePromotion(
                request.getCode(), request.getCustomerId(), request.getOrderTotal(), request.getTicketTypeIds());
        return ResponseEntity.ok(ApiResponse.success(discount));
    }

    // ─────────────────────── BACKWARD COMPATIBLE METHODS ───────────────────────

    @GetMapping("/coupons")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<Page<Coupon>>> findAllCouponsLegacy(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.findAllCoupons(pageable)));
    }

    @PostMapping("/{promotionId}/coupons")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<Coupon>> createCouponLegacy(@PathVariable Long promotionId, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.createCoupon(promotionId, coupon)));
    }

    @GetMapping("/validate-legacy")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> validateCouponLegacy(
            @RequestParam String code,
            @RequestParam Long customerId,
            @RequestParam BigDecimal orderTotal) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.validateAndCalculateDiscount(code, customerId, orderTotal)));
    }
}
