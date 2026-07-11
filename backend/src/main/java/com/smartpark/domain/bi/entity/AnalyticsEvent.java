package com.smartpark.domain.bi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Transactional Outbox Pattern — captures domain events in MySQL,
 * then flushes to BigQuery asynchronously via EventFlushScheduler.
 */
@Entity
@Table(name = "analytics_events", indexes = {
        @Index(name = "idx_event_type", columnList = "event_type"),
        @Index(name = "idx_event_created_at", columnList = "created_at"),
        @Index(name = "idx_event_synced", columnList = "synced")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(name = "event_id", unique = true, nullable = false, updatable = false, columnDefinition = "varchar(36)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID eventId = UUID.randomUUID();

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private EventType eventType;

    /** The authenticated user who triggered the event (null for system events) */
    @Column(name = "user_id")
    private Long userId;

    /** The primary resource this event relates to (booking_id, ticket_id, etc.) */
    @Column(name = "resource_type", length = 50)
    private String resourceType;

    @Column(name = "resource_id")
    private Long resourceId;

    /** Monetary value associated with the event (e.g., payment amount) */
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    /** Free-form JSON metadata for extra context (ticket type, ride name, coupon, etc.) */
    @Column(columnDefinition = "TEXT")
    private String metadata;

    /** Outbox flag — false = pending flush to BigQuery, true = already synced */
    @Builder.Default
    @Column(nullable = false)
    private boolean synced = false;

    @Column(name = "synced_at")
    private LocalDateTime syncedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public enum EventType {
        TICKET_PURCHASED,
        BOOKING_CREATED,
        BOOKING_CANCELLED,
        BOOKING_EXPIRED,
        PAYMENT_COMPLETED,
        PAYMENT_FAILED,
        CHECK_IN,
        RIDE_USED,
        REFUND_ISSUED,
        MEMBERSHIP_UPGRADED,
        COUPON_USED
    }
}
