package com.smartpark.domain.promotion.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.promotion.entity.Coupon;
import com.smartpark.domain.promotion.entity.CouponUsage;
import com.smartpark.domain.promotion.entity.Promotion;
import com.smartpark.domain.promotion.repository.CouponRepository;
import com.smartpark.domain.promotion.repository.CouponUsageRepository;
import com.smartpark.domain.promotion.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final CustomerRepository customerRepository;
    private final AnalyticsEventPublisher analyticsEventPublisher;

    @Transactional(readOnly = true)
    public Page<Promotion> findAllPromotions(Pageable pageable) {
        return promotionRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Promotion findPromotionById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khuyến mãi không tồn tại: " + id));
    }

    @Transactional
    public Promotion createPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    @Transactional(readOnly = true)
    public Page<Coupon> findAllCoupons(Pageable pageable) {
        return couponRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Coupon findCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException("Mã giảm giá không tồn tại: " + code));
    }

    @Transactional
    public Coupon createCoupon(Long promotionId, Coupon coupon) {
        Promotion promotion = findPromotionById(promotionId);
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new BusinessException("Mã giảm giá '" + coupon.getCode() + "' đã tồn tại.");
        }
        coupon.setPromotion(promotion);
        return couponRepository.save(coupon);
    }

    // ─────────────────────── COUPON VALIDATION ───────────────────────

    /**
     * Xác thực mã giảm giá và trả về số tiền được giảm.
     */
    @Transactional(readOnly = true)
    public BigDecimal validateAndCalculateDiscount(String code, Long customerId, BigDecimal orderTotal) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ConflictException("ERR-PROMO-001", "Mã giảm giá không tồn tại."));

        Promotion promotion = coupon.getPromotion();
        LocalDate today = LocalDate.now();

        if (promotion.getStatus() != Promotion.PromotionStatus.ACTIVE || 
            today.isBefore(promotion.getStartDate()) || today.isAfter(promotion.getEndDate())) {
            throw new ConflictException("ERR-PROMO-002", "Chương trình khuyến mãi đã kết thúc hoặc chưa bắt đầu.");
        }

        if (coupon.getStatus() != Coupon.CouponStatus.ACTIVE) {
            throw new ConflictException("ERR-PROMO-003", "Mã giảm giá không còn hiệu lực.");
        }

        if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
            throw new ConflictException("ERR-PROMO-004", "Mã giảm giá đã hết lượt sử dụng.");
        }

        if (coupon.getMinOrderValue() != null && orderTotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new ConflictException("ERR-PROMO-005", "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã.");
        }

        if (couponUsageRepository.existsByCouponIdAndCustomerId(coupon.getId(), customerId)) {
            throw new ConflictException("ERR-PROMO-006", "Bạn đã sử dụng mã giảm giá này rồi.");
        }

        // Tính toán discount
        BigDecimal discount = BigDecimal.ZERO;
        if (promotion.getDiscountType() == Promotion.DiscountType.FIXED_AMOUNT) {
            discount = coupon.getDiscountAmount();
        } else if (promotion.getDiscountType() == Promotion.DiscountType.PERCENTAGE) {
            // Giảm theo % nhưng tối đa bằng discountAmount
            BigDecimal percentageDiscount = orderTotal.multiply(promotion.getValue()).divide(BigDecimal.valueOf(100));
            discount = percentageDiscount.min(coupon.getDiscountAmount());
        }

        // Đảm bảo không giảm quá giá trị đơn hàng
        return discount.min(orderTotal);
    }

    @Transactional
    public void recordCouponUsage(String code, Long customerId, Long bookingId) {
        Coupon coupon = findCouponByCode(code);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException("Khách hàng không tồn tại."));

        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .customer(customer)
                .bookingId(bookingId)
                .build();
        
        couponUsageRepository.save(usage);

        coupon.setCurrentUses(coupon.getCurrentUses() + 1);
        if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
            coupon.setStatus(Coupon.CouponStatus.EXHAUSTED);
        }
        couponRepository.save(coupon);

        log.info("[COUPON_USED] Customer {} used coupon {} for booking {}", customerId, code, bookingId);

        // Trigger COUPON_USED
        analyticsEventPublisher.publish(
                AnalyticsEvent.EventType.COUPON_USED,
                customerId,
                "Coupon",
                coupon.getId(),
                coupon.getDiscountAmount(),
                java.util.Map.of("discountAmount", coupon.getDiscountAmount())
        );
    }
}
