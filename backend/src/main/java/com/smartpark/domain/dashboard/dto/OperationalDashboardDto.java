package com.smartpark.domain.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationalDashboardDto {
    private List<GateStatusItem> gateStatus;
    private List<RideStatusItem> rideStatus;
    private ParkingStatusSummary parkingStatus;
    private LockerStatusSummary lockerStatus;
    private List<ScannerStatusItem> scannerStatus;
    private List<OperatorStatusItem> operatorStatus;
    private List<IncidentItem> incidents;
    private SupportTicketSummary supportTickets;
    private List<MaintenanceItem> maintenanceItems;
    private WeatherImpactData weatherImpact;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GateStatusItem {
        private Long id;
        private String name;
        private String status; // "open", "closed", "maintenance", "error"
        private String lastScan;
        private Integer scansToday;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RideStatusItem {
        private Long id;
        private String name;
        private String status; // "active", "maintenance", "closed", "error"
        private Integer currentLoad;
        private Integer maxCapacity;
        private Integer waitTimeMinutes;
        private String lastUpdated;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParkingStatusSummary {
        private Integer totalSpots;
        private Integer occupied;
        private Integer available;
        private Integer reserved;
        private List<ZoneBreakdownItem> zoneBreakdown;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneBreakdownItem {
        private String zone;
        private Integer occupied;
        private Integer total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LockerStatusSummary {
        private Integer totalLockers;
        private Integer inUse;
        private Integer available;
        private Integer maintenance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScannerStatusItem {
        private Long id;
        private String location;
        private String status; // "online", "offline", "error"
        private String lastActivity;
        private Integer scansToday;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OperatorStatusItem {
        private Long id;
        private String fullName;
        private String role;
        private String status; // "active", "break", "offline"
        private String assignedArea;
        private String shiftStart;
        private String shiftEnd;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IncidentItem {
        private Long id;
        private String title;
        private String severity; // "low", "medium", "high", "critical"
        private String status; // "open", "investigating", "resolved", "closed"
        private String location;
        private String reportedAt;
        private String assignedTo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupportTicketSummary {
        private Integer total;
        private Integer open;
        private Integer inProgress;
        private Integer resolved;
        private Double averageResolutionHours;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaintenanceItem {
        private Long id;
        private String targetName;
        private String targetType; // "ride", "gate", "locker", "scanner", "parking"
        private String scheduledDate;
        private String status; // "scheduled", "in_progress", "completed", "overdue"
        private String priority; // "low", "medium", "high"
        private String assignedTo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeatherImpactData {
        private Integer currentTemp;
        private String condition;
        private String visitorImpact; // "positive", "neutral", "negative"
        private List<ForecastHourItem> forecastHours;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastHourItem {
        private Integer hour;
        private Integer temp;
        private String condition;
    }
}
