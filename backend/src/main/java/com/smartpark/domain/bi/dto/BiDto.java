package com.smartpark.domain.bi.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class BiDto {

    @Data @Builder
    public static class RevenueResponse {
        private BigDecimal totalRevenue;
        private long transactionCount;
        private String period;
    }

    @Data @Builder
    public static class RevenueByTypeItem {
        private String ticketType;
        private BigDecimal revenue;
    }

    @Data @Builder
    public static class VisitorResponse {
        private long visitorCount;
        private String period;
    }

    @Data @Builder
    public static class PeakHourItem {
        private int hour;         // 0-23
        private long visitorCount;
    }

    @Data @Builder
    public static class TopSpenderItem {
        private Long customerId;
        private BigDecimal totalSpent;
        private long transactions;
    }

    @Data @Builder
    public static class DashboardSummary {
        private BigDecimal todayRevenue;
        private long todayVisitors;
        private long pendingBookings;
        private long activeRides;
        private List<PeakHourItem> peakHoursToday;
    }
}
