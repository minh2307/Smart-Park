package com.smartpark.domain.incident.dto;

import com.smartpark.domain.incident.entity.Incident.IncidentSeverity;
import com.smartpark.domain.incident.entity.Incident.IncidentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class IncidentDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotNull(message = "ID phân khu (Zone) không được để trống")
        private Long zoneId;

        @NotBlank(message = "Mô tả chi tiết sự cố không được để trống")
        private String description;

        @NotNull(message = "Mức độ nghiêm trọng của sự cố không được để trống")
        private IncidentSeverity severity;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        private Long zoneId;
        private String description;
        private IncidentSeverity severity;
        private String resolutionDetails;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ResolveRequest {
        @NotBlank(message = "Chi tiết khắc phục sự cố không được để trống")
        private String resolutionDetails;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class HistoryResponse {
        private Long id;
        private String statusFrom;
        private String statusTo;
        private String actionDetails;
        private Long performedById;
        private String performedByUsername;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String incidentNumber;
        private Long zoneId;
        private String zoneName;
        private Long reporterId;
        private String reporterName;
        private String description;
        private IncidentSeverity severity;
        private IncidentStatus status;
        private String resolutionDetails;
        private LocalDateTime createdAt;
        private List<HistoryResponse> history;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StatsResponse {
        private long totalIncidents;
        private long openIncidents;
        private long investigatingIncidents;
        private long resolvedIncidents;
        private long closedIncidents;
        private Map<String, Long> severityBreakdown;
        private double averageResolutionTimeMinutes;
    }
}
