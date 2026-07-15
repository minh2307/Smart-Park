package com.smartpark.domain.settings.mapper;

import com.smartpark.domain.settings.dto.FeatureFlagDto;
import com.smartpark.domain.settings.entity.FeatureFlagSettings;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FeatureFlagMapperTest {
    private final FeatureFlagMapper mapper = new FeatureFlagMapper();

    @Test
    void partialMergePreservesUnspecifiedFlags() {
        FeatureFlagSettings entity = new FeatureFlagSettings();
        entity.setPosEnabled(true);
        entity.setOnlineBookingEnabled(true);
        mapper.merge(FeatureFlagDto.UpdateRequest.builder().posEnabled(false).build(), entity);
        assertFalse(entity.isPosEnabled());
        assertTrue(entity.isOnlineBookingEnabled());
    }
}
