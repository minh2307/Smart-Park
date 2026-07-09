package com.smartpark.domain.promotion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Bảng coupons - mã giảm giá phát hành cho khách hàng.
 * SRS schema: (id, promotion_id, code, max_uses, current_uses, discount_amount, status)
 * MODULE 23: Phát hành mã coupon áp dụng trực tiếp trên tổng giá trị đơn hàng.
 */
@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "max_uses", nullable = false)
    private Integer maxUses;

    @Column(name = "current_uses", nullable = false)
    @Builder.Default
    private Integer currentUses = 0;

    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CouponStatus status = CouponStatus.ACTIVE;

    public enum CouponStatus { ACTIVE, EXHAUSTED, EXPIRED, DISABLED }
}
