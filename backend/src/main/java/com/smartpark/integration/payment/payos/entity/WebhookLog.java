package com.smartpark.integration.payment.payos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "webhook_logs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"provider", "event_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebhookLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(name = "event_id", nullable = false, length = 100)
    private String eventId;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "order_code", length = 100)
    private String orderCode;

    @Column(name = "signature_valid")
    private Boolean signatureValid;

    @Column(name = "processing_status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ProcessingStatus processingStatus;

    @Column(name = "received_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime receivedAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    public enum ProcessingStatus {
        PENDING,
        PROCESSED,
        FAILED,
        IGNORED
    }
}
