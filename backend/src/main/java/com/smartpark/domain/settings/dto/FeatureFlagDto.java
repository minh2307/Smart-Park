package com.smartpark.domain.settings.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public final class FeatureFlagDto {
    private FeatureFlagDto() {}

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = false)
    public static class UpdateRequest {
        private Boolean dynamicPricingEnabled;
        private Boolean aiForecastEnabled;
        private Boolean onlineBookingEnabled;
        private Boolean posEnabled;
        private Boolean membershipEnabled;
        private Boolean weatherIntegrationEnabled;
        private Boolean lprEnabled;
        private Boolean turnstileEnabled;
        private Boolean maintenancePredictionEnabled;
        private Boolean notificationEnabled;

        @JsonAnySetter
        public void rejectUnknown(String name, Object value) {
            throw new IllegalArgumentException("Unsupported feature flag: " + name);
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private boolean dynamicPricingEnabled;
        private boolean aiForecastEnabled;
        private boolean onlineBookingEnabled;
        private boolean posEnabled;
        private boolean membershipEnabled;
        private boolean weatherIntegrationEnabled;
        private boolean lprEnabled;
        private boolean turnstileEnabled;
        private boolean maintenancePredictionEnabled;
        private boolean notificationEnabled;
        private LocalDateTime updatedAt;
        private Long updatedBy;
    }
}
