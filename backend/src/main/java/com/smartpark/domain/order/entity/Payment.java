package com.smartpark.domain.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bảng payments - giao dịch thanh toán cho từng đơn hàng.
 * SRS schema: (id, order_id, payment_method_id, transaction_reference, amount, status, payment_time)
 * MODULE 20: BR-PAY-01: Webhook phải kiểm tra chữ ký checksum trước khi cập nhật trạng thái.
 */
@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id", nullable = false)
    private PaymentMethod paymentMethod;

    /**
     * Mã tham chiếu giao dịch từ cổng thanh toán (VNPay/MoMo transaction ID).
     * BR-PAY-01: dùng để đối soát checksum webhook.
     */
    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @Column(length = 50)
    private String provider;

    @Column(name = "provider_payment_link_id", length = 100)
    private String providerPaymentLinkId;

    @Column(name = "provider_transaction_id", length = 100)
    private String providerTransactionId;

    @Column(name = "order_code", length = 100)
    private String orderCode;

    @Column(name = "checkout_url", length = 500)
    private String checkoutUrl;

    @Column(name = "qr_code", columnDefinition = "TEXT")
    private String qrCode;

    @Column(name = "provider_status", length = 50)
    private String providerStatus;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "failure_reason")
    private String failureReason;

    public enum PaymentStatus { PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED }
}
