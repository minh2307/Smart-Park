package com.smartpark.domain.device.service;

import com.smartpark.domain.device.entity.IoTDevice;
import com.smartpark.domain.device.repository.IoTDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeviceCredentialService {
    private final IoTDeviceRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Optional<IoTDevice> authenticate(String deviceCode, String credential) {
        if (deviceCode == null || credential == null || deviceCode.isBlank() || credential.isBlank()) return Optional.empty();
        Optional<IoTDevice> found = repository.findByDeviceCode(deviceCode.trim());
        if (found.isEmpty() || found.get().getStatus() != IoTDevice.DeviceStatus.ACTIVE
                || !passwordEncoder.matches(credential, found.get().getCredentialHash())) return Optional.empty();
        found.get().setLastSeenAt(LocalDateTime.now());
        return found;
    }
}
