package com.smartpark.domain.locker.service;

import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LockerService {
    // Existing methods
    Page<Locker> findAllLockers(Pageable pageable);
    Locker createLocker(Locker locker);
    Page<LockerTransaction> findAllTransactions(Pageable pageable);
    LockerTransaction createTransaction(LockerTransaction transaction);

    // New methods
    LockerResponseDto findLockerById(Long id);
    LockerResponseDto createLockerDto(LockerRequestDto dto);
    LockerResponseDto updateLocker(Long id, LockerRequestDto dto);
    void deleteLocker(Long id);
    LockerResponseDto updateLockerStatus(Long id, Locker.LockerStatus status);
    LockerDashboardStatsDto getLockerStatistics();
    Page<LockerResponseDto> findLockersWithFilters(String search, Locker.LockerStatus status, Locker.LockerSize size, Pageable pageable);
}
