package com.smartpark.domain.membership.entity;

import com.smartpark.domain.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Bảng memberships - thẻ thành viên của khách hàng.
 * BR-MEM-01: Mỗi khách hàng chỉ có 1 membership active.
 * BR-MEM-02: membershipCode phải unique.
 */
@Entity
@Table(name = "memberships")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_id", nullable = false)
    private MembershipTier tier;

    /** Mã thẻ unique, như mã membership_number */
    @Column(name = "membership_code", unique = true, nullable = false, length = 50)
    private String membershipCode;

    /** Điểm hiện tại (giữ backward compat; LoyaltyAccount là source of truth) */
    @Column(nullable = false)
    @Builder.Default
    private Long points = 0L;

    /** Ngày tham gia */
    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    /** Ngày bắt đầu hiệu lực */
    @Column(name = "start_date")
    private LocalDate startDate;

    /** Ngày hết hạn */
    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    /** Tự động gia hạn */
    @Column(name = "auto_renewal", nullable = false)
    @Builder.Default
    private Boolean autoRenewal = false;

    /** Số tiền đã chi trong kỳ hiện tại (reset khi gia hạn) */
    @Column(name = "current_spending", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal currentSpending = BigDecimal.ZERO;

    /** Tổng số tiền chi tiêu từ trước đến nay */
    @Column(name = "lifetime_spending", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal lifetimeSpending = BigDecimal.ZERO;

    /** Số lần đã gia hạn */
    @Column(name = "renewal_count", nullable = false)
    @Builder.Default
    private Integer renewalCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MembershipStatus status = MembershipStatus.ACTIVE;

    /** Thời điểm hủy (khác null = đã hủy) */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MembershipStatus { ACTIVE, EXPIRED, SUSPENDED, CANCELLED }
}
