package com.smartpark.domain.settings.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.settings")
public class SettingsProperties {
    private int enterpriseMaxAccessTokenMinutes = 60;
    private String featureFlagCacheKey = "settings:feature-flags";
    private long featureFlagCacheTtlSeconds = 300;
}
