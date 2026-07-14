package com.smartpark.domain.membership.entity;

import com.smartpark.domain.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng loyalty_accounts - tài khoản điểm thưởng của khách hàng.
 * Source of truth cho tổng hợp điểm: earned, redeemed, expired.
 * Một customer chỉ có 1 loyalty account (1-1).
 */
@Entity
@Table(name = "loyalty_accounts")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK → customers.id (1-1) */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;

    /** FK → memberships.id (nullable nếu chưa có membership) */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id")
    private Membership membership;

    /** Số điểm hiện có (không âm) */
    @Column(name = "current_points", nullable = false)
    @Builder.Default
    private Long currentPoints = 0L;

    /** Tổng điểm đã tích từ trước đến nay */
    @Column(name = "total_earned", nullable = false)
    @Builder.Default
    private Long totalEarned = 0L;

    /** Tổng điểm đã đổi */
    @Column(name = "total_redeemed", nullable = false)
    @Builder.Default
    private Long totalRedeemed = 0L;

    /** Tổng điểm đã hết hạn */
    @Column(name = "total_expired", nullable = false)
    @Builder.Default
    private Long totalExpired = 0L;

    /** Tổng điểm điều chỉnh thủ công (cộng hoặc trừ) */
    @Column(name = "total_adjusted", nullable = false)
    @Builder.Default
    private Long totalAdjusted = 0L;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
