package com.smartpark.domain.promotion.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.promotion.entity.Promotion;
import com.smartpark.domain.promotion.entity.Coupon;
import com.smartpark.domain.promotion.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Promotion>>> findAllPromotions(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.findAllPromotions(pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Promotion>> createPromotion(@RequestBody Promotion promotion) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.createPromotion(promotion)));
    }

    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<Page<Coupon>>> findAllCoupons(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.findAllCoupons(pageable)));
    }

    @PostMapping("/{promotionId}/coupons")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@PathVariable Long promotionId, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.createCoupon(promotionId, coupon)));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<BigDecimal>> validateCoupon(
            @RequestParam String code,
            @RequestParam Long customerId,
            @RequestParam BigDecimal orderTotal) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.validateAndCalculateDiscount(code, customerId, orderTotal)));
    }
}
