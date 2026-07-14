package com.smartpark.domain.locker.service;

import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.LockerTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LockerRentalService {
    Page<LockerRentalResponseDto> findAllRentals(String search, LockerTransaction.LockerTransactionStatus status, Pageable pageable);
    LockerRentalResponseDto findRentalById(Long id);
    LockerRentalResponseDto rentLocker(LockerRentalRequestDto dto);
    LockerRentalResponseDto returnLocker(LockerRentalReturnDto dto);
    List<LockerRentalResponseDto> findCurrentRentals(String username);
    Page<LockerRentalResponseDto> findRentalHistory(String username, Pageable pageable);
}
