package com.smartpark.domain.device.repository;

import com.smartpark.domain.device.entity.IoTDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IoTDeviceRepository extends JpaRepository<IoTDevice, Long> {
    Optional<IoTDevice> findByDeviceCode(String deviceCode);
}
