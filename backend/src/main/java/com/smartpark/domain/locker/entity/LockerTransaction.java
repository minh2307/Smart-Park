package com.smartpark.domain.locker.entity;

import com.smartpark.domain.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bảng locker_transactions - giao dịch thuê tủ đồ của khách.
 * SRS schema: (id, locker_id, customer_id, start_time, end_time, amount_paid, status)
 * MODULE 27: Thuê tủ qua mã QR, thanh toán tự động khi trả.
 */
@Entity
@Table(name = "locker_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locker_id", nullable = false)
    private Locker locker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /** Null khi khách chưa trả tủ */
    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "deposit", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal deposit = BigDecimal.ZERO;

    @Column(name = "rental_fee", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal rentalFee = BigDecimal.ZERO;

    @Column(name = "amount_paid", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "penalty_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal penaltyAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LockerTransactionStatus status = LockerTransactionStatus.ACTIVE;

    @Column(name = "payment_status", nullable = false, length = 50)
    @Builder.Default
    private String paymentStatus = "PENDING";

    public enum LockerTransactionStatus { ACTIVE, COMPLETED, OVERDUE, CANCELLED }
}
