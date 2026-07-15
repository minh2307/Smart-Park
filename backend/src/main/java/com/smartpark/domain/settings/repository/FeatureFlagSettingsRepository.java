package com.smartpark.domain.settings.repository;

import com.smartpark.domain.settings.entity.FeatureFlagSettings;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface FeatureFlagSettingsRepository extends JpaRepository<FeatureFlagSettings, Byte> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from FeatureFlagSettings f where f.id = 1")
    Optional<FeatureFlagSettings> findForUpdate();
}
