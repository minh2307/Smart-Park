package com.smartpark.domain.promotion.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Bảng promotions - chiến dịch khuyến mãi giảm giá.
 * SRS schema: (id, name, description, start_date, end_date, discount_type, value, status)
 * MODULE 22: Thiết kế chiến dịch marketing, giảm giá theo khung giờ hoặc đối tượng khách.
 */
@Entity
@Table(name = "promotions")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /** Loại chiết khấu: PERCENTAGE (%) hoặc FIXED_AMOUNT (VNĐ cố định) */
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PromotionStatus status = PromotionStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum DiscountType { PERCENTAGE, FIXED_AMOUNT }
    public enum PromotionStatus { ACTIVE, INACTIVE, EXPIRED }
}
