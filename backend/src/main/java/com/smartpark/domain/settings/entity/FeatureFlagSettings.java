package com.smartpark.domain.settings.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature_flag_settings")
@Getter @Setter
public class FeatureFlagSettings {
    @Id private Byte id;
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
    @Version private long version;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}
