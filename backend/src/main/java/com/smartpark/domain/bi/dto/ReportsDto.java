package com.smartpark.domain.bi.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ReportsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportConfigResponse {
        private String reportType;
        private String name;
        private String description;
        private List<String> supportedFormats;
        private List<String> supportedFilters;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportGenerateRequest {
        private String reportType;
        private String exportFormat; // EXCEL, PDF, CSV
        private Map<String, Object> filters;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportPreviewRequest {
        private String reportType;
        private Map<String, Object> filters;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportPreviewResponse {
        private List<String> headers;
        private List<Map<String, Object>> data;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportHistoryResponse {
        private Long id;
        private String reportType;
        private LocalDateTime generatedAt;
        private String generatedBy;
        private String status;
        private String filtersUsed;
        private Long fileSize;
        private String downloadUrl;
        private LocalDateTime expiresAt;
        private String errorMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportHistoryResponse {
        private Long id;
        private Long reportHistoryId;
        private String exportFormat;
        private LocalDateTime exportedAt;
        private String exportedBy;
        private String status;
        private String downloadUrl;
        private LocalDateTime expiresAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportScheduleRequest {
        private String reportType;
        private String cronExpression;
        private String exportFormat;
        private String emailRecipients;
        @Builder.Default
        private boolean enabled = true;
        private Map<String, Object> filters;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportScheduleResponse {
        private Long id;
        private String reportType;
        private String cronExpression;
        private String exportFormat;
        private String emailRecipients;
        private boolean enabled;
        private String filters;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String createdBy;
    }
}
