package com.smartpark.domain.membership.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng point_histories - lịch sử giao dịch điểm thưởng.
 * Mỗi thay đổi điểm đều phải tạo 1 record (immutable audit log).
 */
@Entity
@Table(name = "point_histories")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PointHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id", nullable = false)
    private Membership membership;

    /** ID đơn hàng, thanh toán hoặc entity liên quan */
    @Column(name = "order_id")
    private Long orderId;

    /** Số điểm được cộng (+) */
    @Column(name = "points_earned", nullable = false)
    @Builder.Default
    private Long pointsEarned = 0L;

    /** Số điểm bị trừ (-) */
    @Column(name = "points_redeemed", nullable = false)
    @Builder.Default
    private Long pointsRedeemed = 0L;

    @Column(length = 255)
    private String reason;

    /** Loại giao dịch điểm */
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    @Builder.Default
    private TransactionType transactionType = TransactionType.EARN;

    /** Số dư trước giao dịch */
    @Column(name = "balance_before")
    private Long balanceBefore;

    /** Số dư sau giao dịch */
    @Column(name = "balance_after")
    private Long balanceAfter;

    /** Loại entity tham chiếu: ORDER, PAYMENT, MANUAL */
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    /** Username của admin thực hiện (cho ADJUST) */
    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TransactionType {
        EARN,    // Tích điểm từ thanh toán
        REDEEM,  // Đổi điểm
        ADJUST,  // Điều chỉnh thủ công (admin)
        EXPIRE,  // Điểm hết hạn
        REVERSE  // Hoàn lại điểm (refund)
    }
}
