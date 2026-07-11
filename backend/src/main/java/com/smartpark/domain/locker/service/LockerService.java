package com.smartpark.domain.locker.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.repository.LockerRepository;
import com.smartpark.domain.locker.repository.LockerTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LockerService {

    private final LockerRepository lockerRepository;
    private final LockerTransactionRepository lockerTransactionRepository;

    @Transactional(readOnly = true)
    public Page<Locker> findAllLockers(Pageable pageable) {
        return lockerRepository.findAll(pageable);
    }

    @Transactional
    public Locker createLocker(Locker locker) {
        if (lockerRepository.findByLockerCode(locker.getLockerCode()).isPresent()) {
            throw new BusinessException("Mã tủ đồ '" + locker.getLockerCode() + "' đã tồn tại.");
        }
        return lockerRepository.save(locker);
    }

    @Transactional(readOnly = true)
    public Page<LockerTransaction> findAllTransactions(Pageable pageable) {
        return lockerTransactionRepository.findAll(pageable);
    }

    @Transactional
    public LockerTransaction createTransaction(LockerTransaction transaction) {
        return lockerTransactionRepository.save(transaction);
    }
}
