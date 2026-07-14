package com.smartpark.domain.locker.service;

import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.LockerMaintenance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LockerMaintenanceService {
    Page<LockerMaintenanceResponseDto> findAllMaintenances(String search, LockerMaintenance.MaintenanceStatus status, Pageable pageable);
    LockerMaintenanceResponseDto createMaintenance(LockerMaintenanceRequestDto dto);
    LockerMaintenanceResponseDto updateMaintenance(Long id, LockerMaintenanceRequestDto dto);
    LockerMaintenanceResponseDto completeMaintenance(Long id);
}
