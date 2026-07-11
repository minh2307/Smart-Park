package com.smartpark.domain.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing the summary containing 15 KPI cards.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private KpiCardDto totalRevenue;
    private KpiCardDto totalProfit;
    private KpiCardDto totalVisitors;
    private KpiCardDto ticketsSold;
    private KpiCardDto averageRevenuePerVisitor;
    private KpiCardDto parkingRevenue;
    private KpiCardDto foodRevenue;
    private KpiCardDto retailRevenue;
    private KpiCardDto activeMemberships;
    private KpiCardDto rideUtilization;
    private KpiCardDto averageQueueTime;
    private KpiCardDto rideAvailability;
    private KpiCardDto customerSatisfaction;
    private KpiCardDto employeeProductivity;
    private KpiCardDto incidentCount;
}
