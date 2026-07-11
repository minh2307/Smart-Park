package com.smartpark.domain.bi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.bi.entity.AnalyticsDeadLetter;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.repository.AnalyticsDeadLetterRepository;
import com.smartpark.domain.bi.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DlqService {

    private final AnalyticsDeadLetterRepository dlqRepository;
    private final AnalyticsEventRepository analyticsEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void processFailedEvents(List<AnalyticsEvent> failedEvents) {
        for (AnalyticsEvent event : failedEvents) {
            try {
                String payload = objectMapper.writeValueAsString(event);
                AnalyticsDeadLetter dlqEntry = AnalyticsDeadLetter.builder()
                        .eventId(event.getEventId())
                        .payload(payload)
                        .errorMessage(event.getErrorMessage())
                        .retryCount(event.getRetryCount())
                        .failedAt(LocalDateTime.now())
                        .build();

                dlqRepository.save(dlqEntry);
                analyticsEventRepository.delete(event);
                log.info("[DLQ] Moved event {} to DLQ", event.getEventId());
            } catch (JsonProcessingException e) {
                log.error("[DLQ] Failed to serialize event {}: {}", event.getEventId(), e.getMessage());
            }
        }
    }

    @Transactional
    public boolean requeueEvent(Long dlqId) {
        AnalyticsDeadLetter dlqEntry = dlqRepository.findById(dlqId).orElse(null);
        if (dlqEntry == null) {
            return false;
        }

        try {
            AnalyticsEvent event = objectMapper.readValue(dlqEntry.getPayload(), AnalyticsEvent.class);
            event.setId(null); // Ensure a new record or overwrites appropriately, but actually we just want a new outbox entry
            // Or we keep the same eventId (which is unique) and just save it as new row
            event.setRetryCount(0);
            event.setSynced(false);
            event.setSyncedAt(null);
            event.setErrorMessage(null);

            analyticsEventRepository.save(event);
            dlqRepository.delete(dlqEntry);
            log.info("[DLQ] Requeued event {} back to outbox", dlqEntry.getEventId());
            return true;
        } catch (JsonProcessingException e) {
            log.error("[DLQ] Failed to deserialize DLQ payload for id {}: {}", dlqId, e.getMessage());
            return false;
        }
    }

    public List<AnalyticsDeadLetter> getAllDlqEvents() {
        return dlqRepository.findAll();
    }

    public AnalyticsDeadLetter getDlqEvent(Long id) {
        return dlqRepository.findById(id).orElse(null);
    }

    @Transactional
    public boolean deleteDlqEvent(Long id) {
        if (dlqRepository.existsById(id)) {
            dlqRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
