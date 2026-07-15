package com.smartpark.domain.settings.mapper;

import com.smartpark.domain.settings.dto.FeatureFlagDto;
import com.smartpark.domain.settings.entity.FeatureFlagSettings;
import org.springframework.stereotype.Component;

@Component
public class FeatureFlagMapper {
    public FeatureFlagDto.Response toResponse(FeatureFlagSettings e) {
        return FeatureFlagDto.Response.builder()
                .dynamicPricingEnabled(e.isDynamicPricingEnabled()).aiForecastEnabled(e.isAiForecastEnabled())
                .onlineBookingEnabled(e.isOnlineBookingEnabled()).posEnabled(e.isPosEnabled())
                .membershipEnabled(e.isMembershipEnabled()).weatherIntegrationEnabled(e.isWeatherIntegrationEnabled())
                .lprEnabled(e.isLprEnabled()).turnstileEnabled(e.isTurnstileEnabled())
                .maintenancePredictionEnabled(e.isMaintenancePredictionEnabled()).notificationEnabled(e.isNotificationEnabled())
                .updatedAt(e.getUpdatedAt()).updatedBy(e.getUpdatedBy()).build();
    }

    public void merge(FeatureFlagDto.UpdateRequest r, FeatureFlagSettings e) {
        if (r.getDynamicPricingEnabled() != null) e.setDynamicPricingEnabled(r.getDynamicPricingEnabled());
        if (r.getAiForecastEnabled() != null) e.setAiForecastEnabled(r.getAiForecastEnabled());
        if (r.getOnlineBookingEnabled() != null) e.setOnlineBookingEnabled(r.getOnlineBookingEnabled());
        if (r.getPosEnabled() != null) e.setPosEnabled(r.getPosEnabled());
        if (r.getMembershipEnabled() != null) e.setMembershipEnabled(r.getMembershipEnabled());
        if (r.getWeatherIntegrationEnabled() != null) e.setWeatherIntegrationEnabled(r.getWeatherIntegrationEnabled());
        if (r.getLprEnabled() != null) e.setLprEnabled(r.getLprEnabled());
        if (r.getTurnstileEnabled() != null) e.setTurnstileEnabled(r.getTurnstileEnabled());
        if (r.getMaintenancePredictionEnabled() != null) e.setMaintenancePredictionEnabled(r.getMaintenancePredictionEnabled());
        if (r.getNotificationEnabled() != null) e.setNotificationEnabled(r.getNotificationEnabled());
    }
}
