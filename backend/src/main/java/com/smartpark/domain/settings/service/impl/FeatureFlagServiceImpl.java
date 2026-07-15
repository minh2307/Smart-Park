package com.smartpark.domain.settings.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.settings.config.SettingsProperties;
import com.smartpark.domain.settings.dto.FeatureFlagDto;
import com.smartpark.domain.settings.entity.FeatureFlagSettings;
import com.smartpark.domain.settings.mapper.FeatureFlagMapper;
import com.smartpark.domain.settings.repository.FeatureFlagSettingsRepository;
import com.smartpark.domain.settings.service.FeatureFlagService;
import com.smartpark.domain.settings.service.SettingsAuditSupport;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureFlagServiceImpl implements FeatureFlagService {
    private final FeatureFlagSettingsRepository repository;
    private final FeatureFlagMapper mapper;
    private final SettingsAuditSupport audit;
    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final SettingsProperties properties;

    @Override
    @Transactional(readOnly = true)
    public FeatureFlagDto.Response get() {
        FeatureFlagDto.Response cached = readCache();
        if (cached != null) return cached;
        FeatureFlagDto.Response response = mapper.toResponse(repository.findById((byte) 1)
                .orElseThrow(() -> new ResourceNotFoundException("Feature flag settings", 1L)));
        writeCache(response);
        return response;
    }

    @Override
    @Transactional
    public FeatureFlagDto.Response update(FeatureFlagDto.UpdateRequest request) {
        FeatureFlagSettings entity = repository.findForUpdate()
                .orElseThrow(() -> new ResourceNotFoundException("Feature flag settings", 1L));
        FeatureFlagDto.Response before = mapper.toResponse(entity);
        mapper.merge(request, entity);
        Long userId = audit.currentUserId();
        entity.setUpdatedBy(userId);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.saveAndFlush(entity);
        FeatureFlagDto.Response after = mapper.toResponse(entity);
        audit.record("UPDATE", "feature_flag_settings", 1L, before, after, userId);
        afterCommitCacheRefresh(after);
        return after;
    }

    @Override
    public boolean isEnabled(FeatureFlag flag) {
        FeatureFlagDto.Response f = get();
        return switch (flag) {
            case DYNAMIC_PRICING -> f.isDynamicPricingEnabled();
            case AI_FORECAST -> f.isAiForecastEnabled();
            case ONLINE_BOOKING -> f.isOnlineBookingEnabled();
            case POS -> f.isPosEnabled();
            case MEMBERSHIP -> f.isMembershipEnabled();
            case WEATHER_INTEGRATION -> f.isWeatherIntegrationEnabled();
            case LPR -> f.isLprEnabled();
            case TURNSTILE -> f.isTurnstileEnabled();
            case MAINTENANCE_PREDICTION -> f.isMaintenancePredictionEnabled();
            case NOTIFICATION -> f.isNotificationEnabled();
        };
    }

    @Override
    public void requireEnabled(FeatureFlag flag) {
        if (!isEnabled(flag)) throw new BusinessException(HttpStatus.CONFLICT,
                "ERR-FEATURE-DISABLED", "Feature " + flag.name() + " is disabled");
    }

    private FeatureFlagDto.Response readCache() {
        try {
            String value = redis.opsForValue().get(properties.getFeatureFlagCacheKey());
            return value == null ? null : objectMapper.readValue(value, FeatureFlagDto.Response.class);
        } catch (Exception ex) {
            log.warn("Feature flag cache read failed; falling back to database: {}", ex.getMessage());
            return null;
        }
    }

    private void writeCache(FeatureFlagDto.Response response) {
        try {
            redis.opsForValue().set(properties.getFeatureFlagCacheKey(), objectMapper.writeValueAsString(response),
                    Duration.ofSeconds(properties.getFeatureFlagCacheTtlSeconds()));
        } catch (Exception ex) {
            log.warn("Feature flag cache write failed: {}", ex.getMessage());
        }
    }

    private void afterCommitCacheRefresh(FeatureFlagDto.Response response) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                try { redis.delete(properties.getFeatureFlagCacheKey()); }
                catch (Exception ex) { log.warn("Feature flag cache eviction failed: {}", ex.getMessage()); }
                writeCache(response);
            }
        });
    }
}
