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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @Column(unique = true, length = 50)
    private String code;

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

    @Column(name = "\"value\"", nullable = false, precision = 15, scale = 2)
    private BigDecimal value;

    @Column(name = "max_discount", precision = 15, scale = 2)
    private BigDecimal maxDiscount;

    @Column(name = "min_order", precision = 15, scale = 2)
    private BigDecimal minOrder;

    @Column(name = "applicable_ticket_types", length = 255)
    private String applicableTicketTypes;

    @Column(name = "applicable_membership_tier", length = 100)
    private String applicableMembershipTier;

    @Column(name = "valid_time", length = 100)
    private String validTime;

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
