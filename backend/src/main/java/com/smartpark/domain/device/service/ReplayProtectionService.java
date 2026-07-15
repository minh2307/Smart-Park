package com.smartpark.domain.device.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReplayProtectionService {
    private final StringRedisTemplate redis;

    /** Redis is an accelerator; a DB unique constraint remains authoritative. */
    public boolean claim(String namespace, String deviceCode, String requestId, Duration ttl) {
        try {
            Boolean claimed = redis.opsForValue().setIfAbsent(
                    "device:replay:" + namespace + ":" + deviceCode + ":" + requestId, "1", ttl);
            return claimed == null || claimed;
        } catch (RuntimeException ex) {
            log.warn("Replay cache unavailable for namespace={}; falling back to database", namespace);
            return true;
        }
    }
}
