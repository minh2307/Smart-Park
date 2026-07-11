package com.smartpark.domain.dashboard.service;

import com.smartpark.domain.dashboard.dto.DashboardSummaryDto;
import com.smartpark.domain.dashboard.dto.RevenueAnalyticsDto;
import com.smartpark.domain.dashboard.dto.VisitorFlowDto;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for the Executive Dashboard.
 */
public interface DashboardService {
    /**
     * Retrieves the 15 KPI cards dashboard summary.
     */
    DashboardSummaryDto getDashboardSummary();

    /**
     * Retrieves revenue analytics aggregated chronologically and grouped by day, week, or month.
     */
    List<RevenueAnalyticsDto> getRevenueAnalytics(LocalDate startDate, LocalDate endDate, String groupBy);

    /**
     * Retrieves today's visitor flow grouped by hour.
     */
    List<VisitorFlowDto> getVisitorFlow();
}
