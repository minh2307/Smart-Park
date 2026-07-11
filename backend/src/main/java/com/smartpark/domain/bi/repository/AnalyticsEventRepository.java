package com.smartpark.domain.bi.repository;

import com.smartpark.domain.bi.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    /** Used by EventFlushScheduler to pick up unsynced events in batches */
    List<AnalyticsEvent> findTop500BySyncedFalseAndRetryCountLessThanOrderByCreatedAtAsc(int retryCount);

    /** Used by DLQ processor to pick up failed events that exceed retry limits */
    List<AnalyticsEvent> findTop500BySyncedFalseAndRetryCountGreaterThanEqualOrderByCreatedAtAsc(int retryCount);

    /** Revenue aggregate: sum of PAYMENT_COMPLETED amounts in a date range */
    @Query(value = """
        SELECT COALESCE(SUM(amount), 0)
        FROM analytics_events
        WHERE event_type = 'PAYMENT_COMPLETED'
          AND created_at BETWEEN :from AND :to
        """, nativeQuery = true)
    Double sumRevenueByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Count check-ins (visitors) in a date range */
    @Query(value = """
        SELECT COUNT(*)
        FROM analytics_events
        WHERE event_type = 'CHECK_IN'
          AND created_at BETWEEN :from AND :to
        """, nativeQuery = true)
    Long countCheckInsByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Revenue grouped by metadata resource type (for ticket type breakdown) */
    @Query(value = """
        SELECT metadata, SUM(amount) as total
        FROM analytics_events
        WHERE event_type = 'PAYMENT_COMPLETED'
          AND created_at BETWEEN :from AND :to
        GROUP BY metadata
        """, nativeQuery = true)
    List<Object[]> revenueByResourceInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Hourly event counts (for peak hour analysis) */
    @Query(value = """
        SELECT HOUR(created_at) as hour, COUNT(*) as cnt
        FROM analytics_events
        WHERE event_type = 'CHECK_IN'
          AND created_at BETWEEN :from AND :to
        GROUP BY HOUR(created_at)
        ORDER BY hour
        """, nativeQuery = true)
    List<Object[]> visitorsByHour(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Top spenders */
    @Query(value = """
        SELECT user_id, SUM(amount) as total_spent, COUNT(*) as transactions
        FROM analytics_events
        WHERE event_type = 'PAYMENT_COMPLETED'
          AND user_id IS NOT NULL
        GROUP BY user_id
        ORDER BY total_spent DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> topSpenders(@Param("limit") int limit);

    /** Batch mark synced */
    @Modifying
    @Query("UPDATE AnalyticsEvent e SET e.synced = true, e.syncedAt = :now WHERE e.id IN :ids")
    void markSynced(@Param("ids") List<Long> ids, @Param("now") LocalDateTime now);
}
