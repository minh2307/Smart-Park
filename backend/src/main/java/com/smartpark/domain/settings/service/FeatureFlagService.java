package com.smartpark.domain.settings.service;

import com.smartpark.domain.settings.dto.FeatureFlagDto;

public interface FeatureFlagService {
    FeatureFlagDto.Response get();
    FeatureFlagDto.Response update(FeatureFlagDto.UpdateRequest request);
    boolean isEnabled(FeatureFlag flag);
    void requireEnabled(FeatureFlag flag);

    enum FeatureFlag {
        DYNAMIC_PRICING, AI_FORECAST, ONLINE_BOOKING, POS, MEMBERSHIP,
        WEATHER_INTEGRATION, LPR, TURNSTILE, MAINTENANCE_PREDICTION, NOTIFICATION
    }
}
