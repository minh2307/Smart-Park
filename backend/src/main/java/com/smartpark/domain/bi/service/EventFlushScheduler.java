package com.smartpark.domain.bi.service;

import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Transactional Outbox — periodically flushes unsynced AnalyticsEvents to BigQuery.
 * Runs every 60 seconds. Processes up to 500 events per cycle to avoid long-running transactions.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EventFlushScheduler {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final BigQueryService bigQueryService;
    private final DlqService dlqService;

    @Scheduled(fixedDelay = 60_000)
    @SchedulerLock(name = "EventFlushScheduler_flushPendingEvents", lockAtLeastFor = "30s", lockAtMostFor = "2m")
    @Transactional
    public void flushPendingEvents() {
        // 1. First process dead letters (failed >= 3 times)
        List<AnalyticsEvent> deadLetters = analyticsEventRepository.findTop500BySyncedFalseAndRetryCountGreaterThanEqualOrderByCreatedAtAsc(3);
        if (!deadLetters.isEmpty()) {
            dlqService.processFailedEvents(deadLetters);
        }

        // 2. Process pending items
        List<AnalyticsEvent> pending = analyticsEventRepository.findTop500BySyncedFalseAndRetryCountLessThanOrderByCreatedAtAsc(3);

        if (pending.isEmpty()) {
            return;
        }

        log.info("[BI FLUSH] Processing {} pending analytics events...", pending.size());

        try {
            List<Long> successfulIds = bigQueryService.flushEvents(pending);

            if (!successfulIds.isEmpty()) {
                analyticsEventRepository.markSynced(successfulIds, LocalDateTime.now());
                log.info("[BI FLUSH] Successfully synced {} events.", successfulIds.size());
            } else {
                log.warn("[BI FLUSH] No events were successfully synced in this cycle.");
            }
        } catch (Exception e) {
            // Log and continue — events will be retried on next cycle (outbox retry)
            log.error("[BI FLUSH] Error during flush cycle: {}", e.getMessage(), e);
        }
    }
}
