package com.smartpark.domain.bi.service;

import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.entity.AnalyticsDeadLetter;
import com.smartpark.domain.bi.repository.AnalyticsEventRepository;
import com.smartpark.domain.bi.repository.AnalyticsDeadLetterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class AnalyticsDlqIntegrationTest {

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

    @Autowired
    private AnalyticsDeadLetterRepository dlqRepository;

    @Autowired
    private EventFlushScheduler scheduler;

    @Autowired
    private DlqService dlqService;

    @BeforeEach
    void cleanup() {
        dlqRepository.deleteAll();
        analyticsEventRepository.deleteAll();
    }

    @Test
    @DirtiesContext
    void shouldMoveToDlq_WhenRetryExceeded() {
        // Arrange
        AnalyticsEvent event = AnalyticsEvent.builder()
                .eventType(AnalyticsEvent.EventType.TICKET_PURCHASED)
                .userId(100L)
                .resourceType("Ticket")
                .resourceId(1L)
                .retryCount(3) // Exceeds limit
                .synced(false)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        analyticsEventRepository.saveAndFlush(event);

        // Act
        com.smartpark.domain.bi.service.EventFlushScheduler targetScheduler = 
                org.springframework.test.util.AopTestUtils.getTargetObject(scheduler);
        targetScheduler.flushPendingEvents();

        // Assert
        List<AnalyticsEvent> events = analyticsEventRepository.findAll();
        assertThat(events).isEmpty(); // Moved to DLQ

        List<AnalyticsDeadLetter> dlqEvents = dlqRepository.findAll();
        assertThat(dlqEvents).hasSize(1);
        
        AnalyticsDeadLetter dlqEvent = dlqEvents.get(0);
        assertThat(dlqEvent.getEventId()).isEqualTo(event.getEventId());
        
        // Test Requeue
        boolean requeued = dlqService.requeueEvent(dlqEvent.getId());
        assertThat(requeued).isTrue();
        
        assertThat(dlqRepository.findAll()).isEmpty();
        
        List<AnalyticsEvent> restoredEvents = analyticsEventRepository.findAll();
        assertThat(restoredEvents).hasSize(1);
        assertThat(restoredEvents.get(0).getRetryCount()).isEqualTo(0);
    }
}
