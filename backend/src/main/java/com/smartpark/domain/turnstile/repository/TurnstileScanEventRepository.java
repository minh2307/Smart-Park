package com.smartpark.domain.turnstile.repository;

import com.smartpark.domain.turnstile.entity.TurnstileScanEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TurnstileScanEventRepository extends JpaRepository<TurnstileScanEvent, Long> {
    Optional<TurnstileScanEvent> findByDeviceDeviceCodeAndRequestId(String deviceCode, String requestId);
}
