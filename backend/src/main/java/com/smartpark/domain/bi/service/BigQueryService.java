package com.smartpark.domain.bi.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.bigquery.BigQuery;
import com.google.cloud.bigquery.InsertAllRequest;
import com.google.cloud.bigquery.InsertAllResponse;
import com.google.cloud.bigquery.TableId;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * BigQuery streaming insert service.
 * When app.bigquery.enabled=false (default), operates in mock/log-only mode.
 */
@Service
@Slf4j
public class BigQueryService {

    @Value("${app.bigquery.enabled:false}")
    private boolean enabled;

    @Value("${app.bigquery.dataset-id:smartpark_dw}")
    private String datasetId;

    // Optional bean — null when bigquery.enabled=false
    private final Optional<BigQuery> bigQuery;
    private final ObjectMapper objectMapper;
    private final AnalyticsEventRepository analyticsEventRepository;

    public BigQueryService(Optional<BigQuery> bigQuery, ObjectMapper objectMapper, AnalyticsEventRepository analyticsEventRepository) {
        this.bigQuery = bigQuery;
        this.objectMapper = objectMapper;
        this.analyticsEventRepository = analyticsEventRepository;
    }

    /**
     * Flush a list of AnalyticsEvents to the appropriate BigQuery table.
     * Groups events by type and performs batch streaming inserts.
     */
    public List<Long> flushEvents(List<AnalyticsEvent> events) {
        if (!enabled || bigQuery.isEmpty()) {
            log.debug("[BIGQUERY MOCK] Would flush {} events to BigQuery (disabled in config)", events.size());
            return events.stream().map(AnalyticsEvent::getId).toList();
        }

        List<Long> successfulIds = new ArrayList<>();
        // Group by target table
        Map<String, List<AnalyticsEvent>> grouped = groupByTable(events);

        for (Map.Entry<String, List<AnalyticsEvent>> entry : grouped.entrySet()) {
            String tableId = entry.getKey();
            List<AnalyticsEvent> tableEvents = entry.getValue();
            try {
                insertBatchWithRetry(tableId, tableEvents);
                tableEvents.forEach(e -> successfulIds.add(e.getId()));
            } catch (Exception e) {
                log.error("[BIGQUERY] Failed to flush {} events to table {} after retries: {}",
                        tableEvents.size(), tableId, e.getMessage());
                // Handle failed events
                handleFailedEvents(tableEvents, e.getMessage());
            }
        }
        return successfulIds;
    }

    private void handleFailedEvents(List<AnalyticsEvent> failedEvents, String error) {
        for (AnalyticsEvent event : failedEvents) {
            event.setRetryCount(event.getRetryCount() + 1);
            event.setErrorMessage(error);
        }
        analyticsEventRepository.saveAll(failedEvents);
    }

    private void insertBatchWithRetry(String tableId, List<AnalyticsEvent> events) throws Exception {
        int[] backoffs = {1000, 2000, 4000};
        Exception lastException = null;

        for (int attempt = 0; attempt <= 3; attempt++) {
            try {
                insertBatch(tableId, events);
                return; // success
            } catch (Exception e) {
                lastException = e;
                if (attempt < 3) {
                    log.warn("[BIGQUERY] Insert failed for table {}, retrying in {}ms... (Attempt {})", tableId, backoffs[attempt], attempt + 1);
                    try {
                        Thread.sleep(backoffs[attempt]);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new Exception("Interrupted during backoff", ie);
                    }
                }
            }
        }
        throw new Exception("Failed after 3 retries. Last error: " + lastException.getMessage(), lastException);
    }

    private void insertBatch(String tableId, List<AnalyticsEvent> events) {
        TableId table = TableId.of(datasetId, tableId);
        List<InsertAllRequest.RowToInsert> rows = new ArrayList<>();

        for (AnalyticsEvent event : events) {
            Map<String, Object> row = buildRow(event);
            rows.add(InsertAllRequest.RowToInsert.of(String.valueOf(event.getId()), row));
        }

        InsertAllRequest request = InsertAllRequest.newBuilder(table).setRows(rows).build();
        InsertAllResponse response = bigQuery.get().insertAll(request);

        if (response.hasErrors()) {
            StringBuilder errorMsg = new StringBuilder("Insert errors: ");
            response.getInsertErrors().forEach((idx, errors) -> {
                log.warn("[BIGQUERY] Insert error at row {}: {}", idx, errors);
                errorMsg.append("Row ").append(idx).append(": ").append(errors).append("; ");
            });
            throw new RuntimeException(errorMsg.toString());
        } else {
            log.info("[BIGQUERY] Flushed {} rows to table '{}'", rows.size(), tableId);
        }
    }

    private Map<String, Object> buildRow(AnalyticsEvent event) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("event_id", event.getId());
        row.put("event_type", event.getEventType().name());
        row.put("user_id", event.getUserId());
        row.put("resource_type", event.getResourceType());
        row.put("resource_id", event.getResourceId());
        row.put("amount", event.getAmount() != null ? event.getAmount().doubleValue() : null);
        row.put("created_at", event.getCreatedAt() != null ? event.getCreatedAt().toString() : null);

        // Flatten metadata JSON into extra columns for BigQuery
        if (event.getMetadata() != null) {
            try {
                Map<String, Object> meta = objectMapper.readValue(
                        event.getMetadata(), new TypeReference<Map<String, Object>>() {});
                row.put("metadata", meta);
            } catch (Exception e) {
                row.put("metadata", event.getMetadata());
            }
        }
        return row;
    }

    /**
     * Maps EventType to BigQuery fact table name.
     */
    private Map<String, List<AnalyticsEvent>> groupByTable(List<AnalyticsEvent> events) {
        Map<String, List<AnalyticsEvent>> grouped = new LinkedHashMap<>();
        for (AnalyticsEvent event : events) {
            String table = resolveTable(event.getEventType());
            grouped.computeIfAbsent(table, k -> new ArrayList<>()).add(event);
        }
        return grouped;
    }

    private String resolveTable(AnalyticsEvent.EventType type) {
        return switch (type) {
            case TICKET_PURCHASED, PAYMENT_COMPLETED -> "fact_sales";
            case BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_EXPIRED -> "fact_bookings";
            case CHECK_IN -> "fact_checkins";
            case RIDE_USED -> "fact_ride_usage";
            default -> "fact_events"; // catch-all
        };
    }
}
