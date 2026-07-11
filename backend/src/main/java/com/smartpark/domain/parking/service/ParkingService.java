package com.smartpark.domain.parking.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.parking.entity.ParkingTransaction;
import com.smartpark.domain.parking.repository.ParkingTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParkingService {

    private final ParkingTransactionRepository parkingTransactionRepository;

    @Transactional(readOnly = true)
    public Page<ParkingTransaction> findAll(Pageable pageable) {
        return parkingTransactionRepository.findAll(pageable);
    }

    @Transactional
    public ParkingTransaction create(ParkingTransaction transaction) {
        return parkingTransactionRepository.save(transaction);
    }
}
