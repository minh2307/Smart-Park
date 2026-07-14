package com.smartpark.domain.locker.service.impl;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerMaintenance;
import com.smartpark.domain.locker.mapper.LockerMapper;
import com.smartpark.domain.locker.repository.LockerMaintenanceRepository;
import com.smartpark.domain.locker.repository.LockerRepository;
import com.smartpark.domain.locker.service.LockerMaintenanceService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LockerMaintenanceServiceImpl implements LockerMaintenanceService {

    private final LockerMaintenanceRepository lockerMaintenanceRepository;
    private final LockerRepository lockerRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<LockerMaintenanceResponseDto> findAllMaintenances(String search, LockerMaintenance.MaintenanceStatus status, Pageable pageable) {
        Specification<LockerMaintenance> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("locker").get("lockerCode")), pattern),
                        cb.like(cb.lower(root.get("technician")), pattern),
                        cb.like(cb.lower(root.get("reason")), pattern)
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("maintenanceStatus"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return lockerMaintenanceRepository.findAll(spec, pageable).map(LockerMapper::toMaintenanceResponseDto);
    }

    @Override
    @Transactional
    public LockerMaintenanceResponseDto createMaintenance(LockerMaintenanceRequestDto dto) {
        Locker locker = lockerRepository.findById(dto.getLockerId())
                .orElseThrow(() -> new ResourceNotFoundException("Locker", dto.getLockerId()));

        locker.setStatus(Locker.LockerStatus.MAINTENANCE);
        locker.setCurrentAvailability(false);
        lockerRepository.save(locker);

        LockerMaintenance maintenance = LockerMaintenance.builder()
                .locker(locker)
                .maintenanceDate(dto.getMaintenanceDate())
                .reason(dto.getReason())
                .technician(dto.getTechnician())
                .maintenanceStatus(dto.getMaintenanceStatus() != null ? dto.getMaintenanceStatus() : LockerMaintenance.MaintenanceStatus.SCHEDULED)
                .build();

        LockerMaintenance saved = lockerMaintenanceRepository.save(maintenance);
        return LockerMapper.toMaintenanceResponseDto(saved);
    }

    @Override
    @Transactional
    public LockerMaintenanceResponseDto updateMaintenance(Long id, LockerMaintenanceRequestDto dto) {
        LockerMaintenance maintenance = lockerMaintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LockerMaintenance", id));

        Locker oldLocker = maintenance.getLocker();
        if (!oldLocker.getId().equals(dto.getLockerId())) {
            // Restore old locker
            oldLocker.setStatus(Locker.LockerStatus.AVAILABLE);
            oldLocker.setCurrentAvailability(true);
            lockerRepository.save(oldLocker);

            // Set new locker
            Locker newLocker = lockerRepository.findById(dto.getLockerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Locker", dto.getLockerId()));
            newLocker.setStatus(Locker.LockerStatus.MAINTENANCE);
            newLocker.setCurrentAvailability(false);
            lockerRepository.save(newLocker);
            maintenance.setLocker(newLocker);
        }

        maintenance.setMaintenanceDate(dto.getMaintenanceDate());
        maintenance.setReason(dto.getReason());
        maintenance.setTechnician(dto.getTechnician());
        if (dto.getMaintenanceStatus() != null) {
            maintenance.setMaintenanceStatus(dto.getMaintenanceStatus());
            if (dto.getMaintenanceStatus() == LockerMaintenance.MaintenanceStatus.COMPLETED) {
                maintenance.setCompletionDate(LocalDateTime.now());
                Locker locker = maintenance.getLocker();
                locker.setStatus(Locker.LockerStatus.AVAILABLE);
                locker.setCurrentAvailability(true);
                lockerRepository.save(locker);
            }
        }

        LockerMaintenance saved = lockerMaintenanceRepository.save(maintenance);
        return LockerMapper.toMaintenanceResponseDto(saved);
    }

    @Override
    @Transactional
    public LockerMaintenanceResponseDto completeMaintenance(Long id) {
        LockerMaintenance maintenance = lockerMaintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LockerMaintenance", id));

        maintenance.setMaintenanceStatus(LockerMaintenance.MaintenanceStatus.COMPLETED);
        maintenance.setCompletionDate(LocalDateTime.now());

        Locker locker = maintenance.getLocker();
        locker.setStatus(Locker.LockerStatus.AVAILABLE);
        locker.setCurrentAvailability(true);
        lockerRepository.save(locker);

        LockerMaintenance saved = lockerMaintenanceRepository.save(maintenance);
        return LockerMapper.toMaintenanceResponseDto(saved);
    }
}
