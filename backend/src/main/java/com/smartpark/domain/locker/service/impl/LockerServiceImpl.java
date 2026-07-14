package com.smartpark.domain.locker.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.mapper.LockerMapper;
import com.smartpark.domain.locker.repository.LockerRepository;
import com.smartpark.domain.locker.repository.LockerTransactionRepository;
import com.smartpark.domain.locker.service.LockerService;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.park.repository.ZoneRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LockerServiceImpl implements LockerService {

    private final LockerRepository lockerRepository;
    private final LockerTransactionRepository lockerTransactionRepository;
    private final ZoneRepository zoneRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Locker> findAllLockers(Pageable pageable) {
        return lockerRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public Locker createLocker(Locker locker) {
        if (lockerRepository.findByLockerCode(locker.getLockerCode()).isPresent()) {
            throw new BusinessException("Mã tủ đồ '" + locker.getLockerCode() + "' đã tồn tại.");
        }
        return lockerRepository.save(locker);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LockerTransaction> findAllTransactions(Pageable pageable) {
        return lockerTransactionRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public LockerTransaction createTransaction(LockerTransaction transaction) {
        return lockerTransactionRepository.save(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public LockerResponseDto findLockerById(Long id) {
        Locker locker = lockerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Locker", id));
        return LockerMapper.toResponseDto(locker);
    }

    @Override
    @Transactional
    public LockerResponseDto createLockerDto(LockerRequestDto dto) {
        if (lockerRepository.findByLockerCode(dto.getLockerCode()).isPresent()) {
            throw new BusinessException("Mã tủ đồ '" + dto.getLockerCode() + "' đã tồn tại.");
        }
        Zone zone = zoneRepository.findById(dto.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone", dto.getZoneId()));

        Locker locker = LockerMapper.toEntity(dto, zone);
        Locker saved = lockerRepository.save(locker);
        return LockerMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public LockerResponseDto updateLocker(Long id, LockerRequestDto dto) {
        Locker locker = lockerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Locker", id));

        lockerRepository.findByLockerCode(dto.getLockerCode())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BusinessException("Mã tủ đồ '" + dto.getLockerCode() + "' đã tồn tại.");
                    }
                });

        Zone zone = zoneRepository.findById(dto.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone", dto.getZoneId()));

        LockerMapper.updateEntity(locker, dto, zone);
        Locker saved = lockerRepository.save(locker);
        return LockerMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public void deleteLocker(Long id) {
        Locker locker = lockerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Locker", id));

        // Check if there are any active rentals for this locker
        long activeCount = lockerTransactionRepository.count((root, query, cb) -> cb.and(
                cb.equal(root.get("locker").get("id"), id),
                cb.equal(root.get("status"), LockerTransaction.LockerTransactionStatus.ACTIVE)
        ));
        if (activeCount > 0) {
            throw new BusinessException("Không thể xóa tủ đồ đang có giao dịch thuê hoạt động.");
        }

        lockerRepository.delete(locker);
    }

    @Override
    @Transactional
    public LockerResponseDto updateLockerStatus(Long id, Locker.LockerStatus status) {
        Locker locker = lockerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Locker", id));
        locker.setStatus(status);
        if (status == Locker.LockerStatus.AVAILABLE) {
            locker.setCurrentAvailability(true);
        } else if (status == Locker.LockerStatus.OCCUPIED || status == Locker.LockerStatus.DISABLED || status == Locker.LockerStatus.MAINTENANCE || status == Locker.LockerStatus.OUT_OF_SERVICE) {
            locker.setCurrentAvailability(false);
        }
        Locker saved = lockerRepository.save(locker);
        return LockerMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public LockerDashboardStatsDto getLockerStatistics() {
        long totalLockers = lockerRepository.count();
        long availableCount = lockerRepository.count((root, query, cb) -> cb.equal(root.get("status"), Locker.LockerStatus.AVAILABLE));
        long occupiedCount = lockerRepository.count((root, query, cb) -> cb.equal(root.get("status"), Locker.LockerStatus.OCCUPIED));
        long reservedCount = lockerRepository.count((root, query, cb) -> cb.equal(root.get("status"), Locker.LockerStatus.RESERVED));
        long outOfServiceCount = lockerRepository.count((root, query, cb) -> cb.or(
                cb.equal(root.get("status"), Locker.LockerStatus.MAINTENANCE),
                cb.equal(root.get("status"), Locker.LockerStatus.OUT_OF_SERVICE),
                cb.equal(root.get("status"), Locker.LockerStatus.DISABLED)
        ));

        // Calculate revenue from completed rentals
        BigDecimal totalRevenue = lockerTransactionRepository.findAll().stream()
                .filter(tx -> tx.getStatus() == LockerTransaction.LockerTransactionStatus.COMPLETED)
                .map(tx -> tx.getAmountPaid() != null ? tx.getAmountPaid() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long rentalCount = lockerTransactionRepository.count();
        double usageRate = totalLockers > 0 ? ((double) occupiedCount / totalLockers) * 100 : 0.0;

        return LockerDashboardStatsDto.builder()
                .totalLockers(totalLockers)
                .availableCount(availableCount)
                .occupiedCount(occupiedCount)
                .reservedCount(reservedCount)
                .outOfServiceCount(outOfServiceCount)
                .revenue(totalRevenue)
                .rentalCount(rentalCount)
                .usageRate(usageRate)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LockerResponseDto> findLockersWithFilters(String search, Locker.LockerStatus status, Locker.LockerSize size, Pageable pageable) {
        Specification<Locker> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("lockerCode")), pattern),
                        cb.like(cb.lower(root.get("lockerNumber")), pattern),
                        cb.like(cb.lower(root.get("location")), pattern)
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (size != null) {
                predicates.add(cb.equal(root.get("size"), size));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return lockerRepository.findAll(spec, pageable).map(LockerMapper::toResponseDto);
    }
}
