package com.smartpark.domain.parking.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.parking.dto.ParkingSessionDto;
import com.smartpark.domain.parking.entity.Gate;
import com.smartpark.domain.parking.entity.ParkingLot;
import com.smartpark.domain.parking.entity.ParkingTransaction;
import com.smartpark.domain.parking.repository.GateRepository;
import com.smartpark.domain.parking.repository.ParkingLotRepository;
import com.smartpark.domain.parking.repository.ParkingSessionRepository;
import com.smartpark.domain.parking.service.ParkingSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParkingSessionServiceImpl implements ParkingSessionService {

    private final ParkingSessionRepository sessionRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final GateRepository gateRepository;

    // ─────────────────────────── MAPPER ────────────────────────────

    private ParkingSessionDto.Response toResponse(ParkingTransaction tx) {
        Long durationMinutes = null;
        if (tx.getEntryTime() != null && tx.getExitTime() != null) {
            durationMinutes = Duration.between(tx.getEntryTime(), tx.getExitTime()).toMinutes();
        }

        return ParkingSessionDto.Response.builder()
                .id(tx.getId())
                .parkingAreaId(tx.getParkingLot() != null ? tx.getParkingLot().getId() : null)
                .parkingAreaName(tx.getParkingLot() != null ? tx.getParkingLot().getName() : null)
                .entryGateId(tx.getEntryGate() != null ? tx.getEntryGate().getId() : null)
                .entryGateCode(tx.getEntryGate() != null ? tx.getEntryGate().getCode() : null)
                .exitGateId(tx.getExitGate() != null ? tx.getExitGate().getId() : null)
                .exitGateCode(tx.getExitGate() != null ? tx.getExitGate().getCode() : null)
                .licensePlate(tx.getVehiclePlate())
                .vehicleType(tx.getVehicleType())
                .entryTime(tx.getEntryTime())
                .exitTime(tx.getExitTime())
                .durationMinutes(durationMinutes)
                .parkingFee(tx.getParkingFee())
                .amountPaid(tx.getAmountPaid())
                .paymentStatus(tx.getPaymentStatus())
                .status(tx.getStatus())
                .notes(tx.getNotes())
                .build();
    }

    // ─────────────────────────── QUERIES ────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ParkingSessionDto.Response> getAll(
            String licensePlate, ParkingTransaction.ParkingStatus status, Long parkingAreaId,
            Long entryGateId, ParkingTransaction.VehicleType vehicleType,
            LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable) {
        String plateVal = (licensePlate == null || licensePlate.isBlank()) ? null : licensePlate.trim();
        return sessionRepository.findAllWithFilters(
                plateVal, status, parkingAreaId, entryGateId, vehicleType, fromDate, toDate, pageable
        ).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ParkingSessionDto.Response getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ParkingSessionDto.Response> getCurrentSessions(Pageable pageable) {
        return sessionRepository.findCurrentSessions(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ParkingSessionDto.Response> getHistory(Pageable pageable) {
        return sessionRepository.findHistory(pageable).map(this::toResponse);
    }

    // ─────────────────────────── CHECK-IN ───────────────────────────

    @Override
    @Transactional
    public ParkingSessionDto.Response checkIn(ParkingSessionDto.CheckInRequest request) {
        String plate = request.getLicensePlate().toUpperCase().trim();

        // BR-SESSION-01: biển số không được đang có phiên active
        sessionRepository.findByVehiclePlateAndStatus(plate, ParkingTransaction.ParkingStatus.PARKED)
                .ifPresent(existing -> {
                    throw new ConflictException("ERR-SESSION-001",
                            "Xe " + plate + " đang có phiên đỗ xe chưa kết thúc (ID=" + existing.getId() + ").");
                });

        // Lấy parking area
        ParkingLot lot = parkingLotRepository.findByIdAndNotDeleted(request.getParkingAreaId())
                .orElseThrow(() -> new ResourceNotFoundException("ParkingArea", request.getParkingAreaId()));

        // BR-SESSION-02: bãi phải ACTIVE
        if (lot.getStatus() == ParkingLot.ParkingLotStatus.CLOSED) {
            throw new BusinessException("ERR-SESSION-002", "Bãi đỗ xe '" + lot.getName() + "' đang đóng cửa.");
        }

        // BR-SESSION-03: bãi không được FULL
        if (lot.getStatus() == ParkingLot.ParkingLotStatus.FULL) {
            throw new BusinessException("ERR-SESSION-003", "Bãi đỗ xe '" + lot.getName() + "' đã đầy.");
        }

        // Lấy cổng vào
        Gate entryGate = null;
        if (request.getEntryGateId() != null) {
            entryGate = gateRepository.findByIdAndNotDeleted(request.getEntryGateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gate", request.getEntryGateId()));

            // BR-GATE-03: gate bị CLOSED/MAINTENANCE không nhận xe
            if (entryGate.getStatus() != Gate.GateStatus.OPEN) {
                throw new BusinessException("ERR-GATE-002",
                        "Cổng '" + entryGate.getCode() + "' không ở trạng thái OPEN.");
            }
        }

        ParkingTransaction tx = ParkingTransaction.builder()
                .parkingLot(lot)
                .entryGate(entryGate)
                .vehiclePlate(plate)
                .vehicleType(request.getVehicleType())
                .entryTime(LocalDateTime.now())
                .status(ParkingTransaction.ParkingStatus.PARKED)
                .paymentStatus(ParkingTransaction.PaymentStatus.UNPAID)
                .notes(request.getNotes())
                .build();

        ParkingTransaction saved = sessionRepository.save(tx);

        // Tăng số chỗ đang dùng
        lot.setOccupiedSpaces(lot.getOccupiedSpaces() + 1);
        if (lot.getOccupiedSpaces() >= lot.getTotalSpaces()) {
            lot.setStatus(ParkingLot.ParkingLotStatus.FULL);
        }
        parkingLotRepository.save(lot);

        log.info("[PARKING CHECK-IN] id={} plate={} area={}", saved.getId(), plate, lot.getName());
        return toResponse(saved);
    }

    // ─────────────────────────── CHECK-OUT ───────────────────────────

    @Override
    @Transactional
    public ParkingSessionDto.Response checkOut(ParkingSessionDto.CheckOutRequest request) {
        String plate = request.getLicensePlate().toUpperCase().trim();

        // Tìm phiên đang PARKED theo biển số
        ParkingTransaction tx = sessionRepository.findByVehiclePlateAndStatus(
                plate, ParkingTransaction.ParkingStatus.PARKED)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ParkingSession đang hoạt động với biển số", plate));

        LocalDateTime exitTime = LocalDateTime.now();
        long durationMinutes = Duration.between(tx.getEntryTime(), exitTime).toMinutes();

        // Tính phí đỗ xe
        BigDecimal fee = calculateParkingFee(tx.getParkingLot(), durationMinutes);

        // Gate ra
        Gate exitGate = null;
        if (request.getExitGateId() != null) {
            exitGate = gateRepository.findByIdAndNotDeleted(request.getExitGateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gate", request.getExitGateId()));
        }

        tx.setExitTime(exitTime);
        tx.setExitGate(exitGate);
        tx.setParkingFee(fee);
        tx.setAmountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : fee);
        tx.setPaymentStatus(request.getPaymentStatus() != null
                ? request.getPaymentStatus()
                : ParkingTransaction.PaymentStatus.PAID);
        tx.setStatus(ParkingTransaction.ParkingStatus.EXITED);
        if (request.getNotes() != null) {
            tx.setNotes(request.getNotes());
        }

        ParkingTransaction saved = sessionRepository.save(tx);

        // Giảm số chỗ đang dùng
        ParkingLot lot = tx.getParkingLot();
        int newOccupied = Math.max(0, lot.getOccupiedSpaces() - 1);
        lot.setOccupiedSpaces(newOccupied);
        if (lot.getStatus() == ParkingLot.ParkingLotStatus.FULL && newOccupied < lot.getTotalSpaces()) {
            lot.setStatus(ParkingLot.ParkingLotStatus.ACTIVE);
        }
        parkingLotRepository.save(lot);

        log.info("[PARKING CHECK-OUT] id={} plate={} duration={}min fee={}", saved.getId(), plate, durationMinutes, fee);
        return toResponse(saved);
    }

    // ─────────────────────────── HELPER ─────────────────────────────

    /**
     * Tính phí đỗ xe.
     * Logic: mỗi giờ tính hourlyRate. Nếu không cấu hình thì miễn phí.
     * Nếu có dailyRate và thời gian > 24h → áp dụng dailyRate cho mỗi ngày.
     */
    private BigDecimal calculateParkingFee(ParkingLot lot, long durationMinutes) {
        if (lot.getHourlyRate() == null) {
            return BigDecimal.ZERO;
        }

        // Làm tròn lên theo giờ (tối thiểu 1 giờ)
        long hours = (long) Math.ceil(durationMinutes / 60.0);
        hours = Math.max(1, hours);

        // Nếu có daily rate và thời gian > 24h, so sánh và dùng giá nhỏ hơn
        if (lot.getDailyRate() != null && durationMinutes > 24 * 60) {
            long days = (long) Math.ceil(durationMinutes / (24.0 * 60));
            BigDecimal dailyFee = lot.getDailyRate().multiply(BigDecimal.valueOf(days));
            BigDecimal hourlyFee = lot.getHourlyRate().multiply(BigDecimal.valueOf(hours));
            return dailyFee.min(hourlyFee).setScale(0, RoundingMode.HALF_UP);
        }

        return lot.getHourlyRate()
                .multiply(BigDecimal.valueOf(hours))
                .setScale(0, RoundingMode.HALF_UP);
    }

    private ParkingTransaction findOrThrow(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ParkingSession", id));
    }
}
