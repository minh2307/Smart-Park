package com.smartpark.domain.membership.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bảng membership_tiers - hạng thẻ thành viên.
 * SRS: BRONZE → SILVER → GOLD → PLATINUM
 */
@Entity
@Table(name = "membership_tiers")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MembershipTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã tier duy nhất, ví dụ: BRONZE, SILVER, GOLD, PLATINUM */
    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Chi tiêu tối thiểu (VND) để đạt tier này */
    @Column(name = "min_spend", precision = 15, scale = 2)
    private BigDecimal minSpend;

    /** Tỷ lệ giảm giá (%) */
    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    /** Hệ số nhân điểm thưởng */
    @Column(name = "points_multiplier", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal pointsMultiplier = BigDecimal.ONE;

    /** Ưưu tiên hàng chờ (priority queue) */
    @Column(name = "priority_queue", nullable = false)
    @Builder.Default
    private Boolean priorityQueue = false;

    /** Miễn phí đỗ xe */
    @Column(name = "free_parking", nullable = false)
    @Builder.Default
    private Boolean freeParking = false;

    /** Mô tả quyền lợi sinh nhật */
    @Column(name = "birthday_benefit", columnDefinition = "TEXT")
    private String birthdayBenefit;

    /** Quyền vào phòng chờ VIP */
    @Column(name = "lounge_access", nullable = false)
    @Builder.Default
    private Boolean loungeAccess = false;

    /** Thứ tự hiển thị (nhỏ = thấp hơn) */
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TierStatus status = TierStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Soft delete */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum TierStatus { ACTIVE, INACTIVE }
}
