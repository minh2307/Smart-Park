package com.smartpark.domain.parking.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.repository.ParkRepository;
import com.smartpark.domain.parking.dto.ParkingAreaDto;
import com.smartpark.domain.parking.entity.ParkingLot;
import com.smartpark.domain.parking.repository.ParkingLotRepository;
import com.smartpark.domain.parking.service.ParkingAreaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParkingAreaServiceImpl implements ParkingAreaService {

    private final ParkingLotRepository parkingLotRepository;
    private final ParkRepository parkRepository;

    // ─────────────────────────── MAPPER ────────────────────────────

    private ParkingAreaDto.Response toResponse(ParkingLot lot) {
        int available = lot.getTotalSpaces() - lot.getOccupiedSpaces();
        double occupancyRate = lot.getTotalSpaces() > 0
                ? (double) lot.getOccupiedSpaces() / lot.getTotalSpaces() * 100
                : 0.0;

        return ParkingAreaDto.Response.builder()
                .id(lot.getId())
                .parkId(lot.getPark() != null ? lot.getPark().getId() : null)
                .parkName(lot.getPark() != null ? lot.getPark().getName() : null)
                .name(lot.getName())
                .vehicleType(lot.getVehicleType())
                .totalSpaces(lot.getTotalSpaces())
                .occupiedSpaces(lot.getOccupiedSpaces())
                .availableSpaces(Math.max(0, available))
                .hourlyRate(lot.getHourlyRate())
                .dailyRate(lot.getDailyRate())
                .description(lot.getDescription())
                .status(lot.getStatus())
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .createdAt(lot.getCreatedAt())
                .updatedAt(lot.getUpdatedAt())
                .build();
    }

    // ─────────────────────────── QUERIES ────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ParkingAreaDto.Response> getAll(String search, ParkingLot.ParkingLotStatus status,
                                                 ParkingLot.VehicleType vehicleType, Pageable pageable) {
        String searchVal = (search == null || search.isBlank()) ? null : search.trim();
        return parkingLotRepository.findAllActive(searchVal, status, vehicleType, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ParkingAreaDto.Response getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    // ─────────────────────────── COMMANDS ───────────────────────────

    @Override
    @Transactional
    public ParkingAreaDto.Response create(ParkingAreaDto.CreateRequest request) {
        Park park = parkRepository.findById(request.getParkId())
                .orElseThrow(() -> new ResourceNotFoundException("Park", request.getParkId()));

        ParkingLot lot = ParkingLot.builder()
                .park(park)
                .name(request.getName())
                .vehicleType(request.getVehicleType() != null
                        ? request.getVehicleType()
                        : ParkingLot.VehicleType.ALL)
                .totalSpaces(request.getTotalSpaces())
                .occupiedSpaces(0)
                .hourlyRate(request.getHourlyRate())
                .dailyRate(request.getDailyRate())
                .description(request.getDescription())
                .status(ParkingLot.ParkingLotStatus.ACTIVE)
                .build();

        ParkingLot saved = parkingLotRepository.save(lot);
        log.info("[PARKING AREA CREATED] id={} name={}", saved.getId(), saved.getName());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ParkingAreaDto.Response update(Long id, ParkingAreaDto.UpdateRequest request) {
        ParkingLot lot = findOrThrow(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            lot.setName(request.getName());
        }
        if (request.getVehicleType() != null) {
            lot.setVehicleType(request.getVehicleType());
        }
        if (request.getTotalSpaces() != null) {
            // BR-PARK-01: sức chứa mới không được nhỏ hơn số chỗ đã chiếm
            if (request.getTotalSpaces() < lot.getOccupiedSpaces()) {
                throw new BusinessException("ERR-PARK-001",
                        "Sức chứa mới (" + request.getTotalSpaces() + ") không thể nhỏ hơn số xe đang đỗ ("
                                + lot.getOccupiedSpaces() + ").");
            }
            lot.setTotalSpaces(request.getTotalSpaces());
        }
        if (request.getHourlyRate() != null) {
            lot.setHourlyRate(request.getHourlyRate());
        }
        if (request.getDailyRate() != null) {
            lot.setDailyRate(request.getDailyRate());
        }
        if (request.getDescription() != null) {
            lot.setDescription(request.getDescription());
        }

        ParkingLot saved = parkingLotRepository.save(lot);
        log.info("[PARKING AREA UPDATED] id={}", id);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ParkingLot lot = findOrThrow(id);

        // BR-PARK-02: không xóa nếu còn active session
        long activeSessions = parkingLotRepository.countActiveSessionsByLotId(id);
        if (activeSessions > 0) {
            throw new ConflictException("ERR-PARK-002",
                    "Không thể xóa bãi đỗ xe vì vẫn còn " + activeSessions
                            + " phiên đỗ xe đang hoạt động.");
        }

        lot.setDeletedAt(LocalDateTime.now());
        lot.setStatus(ParkingLot.ParkingLotStatus.CLOSED);
        parkingLotRepository.save(lot);
        log.info("[PARKING AREA DELETED] id={}", id);
    }

    @Override
    @Transactional
    public ParkingAreaDto.Response updateStatus(Long id, ParkingAreaDto.StatusRequest request) {
        ParkingLot lot = findOrThrow(id);
        lot.setStatus(request.getStatus());
        ParkingLot saved = parkingLotRepository.save(lot);
        log.info("[PARKING AREA STATUS] id={} -> {}", id, request.getStatus());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ParkingAreaDto.Statistics getStatistics() {
        long total = parkingLotRepository.countByDeletedAtIsNull();
        long active = parkingLotRepository.countByStatusAndDeletedAtIsNull(ParkingLot.ParkingLotStatus.ACTIVE);
        long full = parkingLotRepository.countByStatusAndDeletedAtIsNull(ParkingLot.ParkingLotStatus.FULL);
        long closed = parkingLotRepository.countByStatusAndDeletedAtIsNull(ParkingLot.ParkingLotStatus.CLOSED);

        // Aggregate capacity
        int[] totals = {0, 0};
        parkingLotRepository.findAllActive(null, null, null, Pageable.unpaged())
                .forEach(lot -> {
                    totals[0] += lot.getTotalSpaces();
                    totals[1] += lot.getOccupiedSpaces();
                });
        int totalCapacity = totals[0];
        int totalOccupied = totals[1];
        int totalAvailable = Math.max(0, totalCapacity - totalOccupied);
        double overallOccupancyRate = totalCapacity > 0
                ? Math.round((double) totalOccupied / totalCapacity * 1000.0) / 10.0
                : 0.0;

        return ParkingAreaDto.Statistics.builder()
                .totalAreas(total)
                .activeAreas(active)
                .fullAreas(full)
                .closedAreas(closed)
                .totalCapacity(totalCapacity)
                .totalOccupied(totalOccupied)
                .totalAvailable(totalAvailable)
                .overallOccupancyRate(overallOccupancyRate)
                .build();
    }

    // ─────────────────────────── HELPER ─────────────────────────────

    private ParkingLot findOrThrow(Long id) {
        return parkingLotRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException("ParkingArea", id));
    }
}
