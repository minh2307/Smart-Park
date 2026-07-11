package com.smartpark.domain.bi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.event.DomainAnalyticsEvent;
import com.smartpark.domain.bi.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Central analytics publisher.
 *
 * Usage in services:
 *   analyticsPublisher.publish(AnalyticsEvent.EventType.BOOKING_CREATED, userId, "Booking", bookingId, amount, Map.of("coupon", code));
 *
 * Uses @TransactionalEventListener(AFTER_COMMIT) to ensure events are only
 * persisted once the parent business transaction has successfully committed.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AnalyticsEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;
    private final AnalyticsEventRepository analyticsEventRepository;
    private final ObjectMapper objectMapper;

    /**
     * Publish an analytics event. Call from within an active transaction.
     * The event will be saved to DB only after the outer transaction commits.
     */
    public void publish(AnalyticsEvent.EventType eventType,
                        Long userId,
                        String resourceType,
                        Long resourceId,
                        BigDecimal amount,
                        Map<String, Object> metadata) {
        UUID eventId = UUID.randomUUID();
        String metaJson = null;
        if (metadata != null && !metadata.isEmpty()) {
            if (metadata.containsKey("eventId")) {
                try {
                    eventId = UUID.fromString(metadata.get("eventId").toString());
                } catch (IllegalArgumentException e) {
                    log.warn("[ANALYTICS] Invalid eventId format: {}", metadata.get("eventId"));
                }
            }
            try {
                metaJson = objectMapper.writeValueAsString(metadata);
            } catch (JsonProcessingException e) {
                log.warn("[ANALYTICS] Failed to serialize metadata for event {}: {}", eventType, e.getMessage());
            }
        }

        AnalyticsEvent event = AnalyticsEvent.builder()
                .eventId(eventId)
                .eventType(eventType)
                .userId(userId)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .amount(amount)
                .metadata(metaJson)
                .synced(false)
                .retryCount(0)
                .build();

        applicationEventPublisher.publishEvent(new DomainAnalyticsEvent(this, event));
    }

    /**
     * Convenience overload without amount and metadata.
     */
    public void publish(AnalyticsEvent.EventType eventType, Long userId, String resourceType, Long resourceId) {
        publish(eventType, userId, resourceType, resourceId, null, null);
    }

    /**
     * Fires AFTER the outer transaction commits — guarantees data is saved before event is persisted.
     * If BigQuery or this listener fails, the business transaction is NOT rolled back.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleEvent(DomainAnalyticsEvent domainEvent) {
        try {
            analyticsEventRepository.save(domainEvent.getAnalyticsEvent());
            log.debug("[ANALYTICS] Event saved: type={} resourceId={}",
                    domainEvent.getAnalyticsEvent().getEventType(),
                    domainEvent.getAnalyticsEvent().getResourceId());
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.warn("[ANALYTICS] Duplicate event ignored: type={} resourceId={}", 
                    domainEvent.getAnalyticsEvent().getEventType(), 
                    domainEvent.getAnalyticsEvent().getResourceId());
        } catch (Exception e) {
            // Non-critical — do not propagate. The business transaction already committed.
            log.error("[ANALYTICS] Failed to save analytics event: {}", e.getMessage());
        }
    }
}
