package com.smartpark.domain.parking.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.park.repository.ZoneRepository;
import com.smartpark.domain.parking.dto.GateDto;
import com.smartpark.domain.parking.entity.Gate;
import com.smartpark.domain.parking.entity.ParkingLot;
import com.smartpark.domain.parking.repository.GateRepository;
import com.smartpark.domain.parking.repository.ParkingLotRepository;
import com.smartpark.domain.parking.service.GateService;
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
public class GateServiceImpl implements GateService {

    private final GateRepository gateRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final ZoneRepository zoneRepository;

    // ─────────────────────────── MAPPER ────────────────────────────

    private GateDto.Response toResponse(Gate gate) {
        return GateDto.Response.builder()
                .id(gate.getId())
                .code(gate.getCode())
                .name(gate.getName())
                .type(gate.getType())
                .status(gate.getStatus())
                .parkingAreaId(gate.getParkingArea() != null ? gate.getParkingArea().getId() : null)
                .parkingAreaName(gate.getParkingArea() != null ? gate.getParkingArea().getName() : null)
                .zoneId(gate.getZone() != null ? gate.getZone().getId() : null)
                .zoneName(gate.getZone() != null ? gate.getZone().getName() : null)
                .description(gate.getDescription())
                .deviceInfo(gate.getDeviceInfo())
                .createdAt(gate.getCreatedAt())
                .updatedAt(gate.getUpdatedAt())
                .build();
    }

    // ─────────────────────────── QUERIES ────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<GateDto.Response> getAll(String search, Gate.GateStatus status, Gate.GateType type,
                                         Long parkingAreaId, Long zoneId, Pageable pageable) {
        String searchVal = (search == null || search.isBlank()) ? null : search.trim();
        return gateRepository.findAllWithFilters(searchVal, status, type, parkingAreaId, zoneId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public GateDto.Response getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    // ─────────────────────────── COMMANDS ───────────────────────────

    @Override
    @Transactional
    public GateDto.Response create(GateDto.CreateRequest request) {
        // BR-GATE-01: mã cổng phải unique
        if (gateRepository.existsByCodeAndDeletedAtIsNull(request.getCode())) {
            throw new ConflictException("ERR-GATE-001",
                    "Mã cổng '" + request.getCode() + "' đã tồn tại trong hệ thống.");
        }

        ParkingLot parkingArea = null;
        if (request.getParkingAreaId() != null) {
            parkingArea = parkingLotRepository.findByIdAndNotDeleted(request.getParkingAreaId())
                    .orElseThrow(() -> new ResourceNotFoundException("ParkingArea", request.getParkingAreaId()));
        }

        Zone zone = null;
        if (request.getZoneId() != null) {
            zone = zoneRepository.findById(request.getZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Zone", request.getZoneId()));
        }

        Gate gate = Gate.builder()
                .code(request.getCode())
                .name(request.getName())
                .type(request.getType())
                .status(request.getStatus() != null ? request.getStatus() : Gate.GateStatus.OPEN)
                .parkingArea(parkingArea)
                .zone(zone)
                .description(request.getDescription())
                .deviceInfo(request.getDeviceInfo())
                .build();

        Gate saved = gateRepository.save(gate);
        log.info("[GATE CREATED] id={} code={}", saved.getId(), saved.getCode());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public GateDto.Response update(Long id, GateDto.UpdateRequest request) {
        Gate gate = findOrThrow(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            gate.setName(request.getName());
        }
        if (request.getType() != null) {
            gate.setType(request.getType());
        }
        if (request.getDescription() != null) {
            gate.setDescription(request.getDescription());
        }
        if (request.getDeviceInfo() != null) {
            gate.setDeviceInfo(request.getDeviceInfo());
        }
        if (request.getParkingAreaId() != null) {
            ParkingLot area = parkingLotRepository.findByIdAndNotDeleted(request.getParkingAreaId())
                    .orElseThrow(() -> new ResourceNotFoundException("ParkingArea", request.getParkingAreaId()));
            gate.setParkingArea(area);
        }
        if (request.getZoneId() != null) {
            Zone zone = zoneRepository.findById(request.getZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Zone", request.getZoneId()));
            gate.setZone(zone);
        }

        Gate saved = gateRepository.save(gate);
        log.info("[GATE UPDATED] id={}", id);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Gate gate = findOrThrow(id);
        gate.setDeletedAt(LocalDateTime.now());
        gate.setStatus(Gate.GateStatus.CLOSED);
        gateRepository.save(gate);
        log.info("[GATE DELETED] id={} code={}", id, gate.getCode());
    }

    @Override
    @Transactional
    public GateDto.Response updateStatus(Long id, GateDto.StatusRequest request) {
        Gate gate = findOrThrow(id);
        gate.setStatus(request.getStatus());
        Gate saved = gateRepository.save(gate);
        log.info("[GATE STATUS] id={} code={} -> {}", id, gate.getCode(), request.getStatus());
        return toResponse(saved);
    }

    // ─────────────────────────── HELPER ─────────────────────────────

    private Gate findOrThrow(Long id) {
        return gateRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gate", id));
    }
}
