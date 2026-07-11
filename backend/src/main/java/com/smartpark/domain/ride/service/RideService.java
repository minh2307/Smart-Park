package com.smartpark.domain.ride.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.park.repository.ZoneRepository;
import com.smartpark.domain.ride.entity.Ride;
import com.smartpark.domain.ride.entity.RideCapacity;
import com.smartpark.domain.ride.entity.RideMaintenance;
import com.smartpark.domain.ride.entity.RideSchedule;
import com.smartpark.domain.ride.repository.RideCapacityRepository;
import com.smartpark.domain.ride.repository.RideMaintenanceRepository;
import com.smartpark.domain.ride.repository.RideRepository;
import com.smartpark.domain.ride.repository.RideScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RideService {

    private final RideRepository rideRepository;
    private final RideScheduleRepository scheduleRepository;
    private final ZoneRepository zoneRepository;
    private final RideMaintenanceRepository maintenanceRepository;
    private final RideCapacityRepository capacityRepository;
    private final AnalyticsEventPublisher analyticsEventPublisher;

    @Transactional(readOnly = true)
    public Page<Ride> findAll(Pageable pageable) {
        return rideRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Ride findById(Long id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride", id));
    }

    @Transactional
    public Ride create(Long zoneId, Ride ride) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Zone", zoneId));
        if (rideRepository.existsByCode(ride.getCode())) {
            throw new BusinessException("Mã trò chơi '" + ride.getCode() + "' đã tồn tại.");
        }
        ride.setZone(zone);
        return rideRepository.save(ride);
    }

    @Transactional
    public Ride updateStatus(Long id, Ride.RideStatus status) {
        Ride ride = findById(id);
        ride.setStatus(status);
        return rideRepository.save(ride);
    }

    // ──────────────────────────── QUEUE LOGIC ─────────────────────────────

    /**
     * Tính toán thời gian chờ dựa trên công thức:
     * WaitTime = ceil(CurrentWaitingCount / Capacity) * TurnDuration
     * (Giả định TurnDuration = duration_seconds + 120s unload/load)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getQueueInfo(Long rideId) {
        Ride ride = findById(rideId);
        
        // Lấy capacity của khung giờ hiện tại (làm tròn xuống giờ)
        LocalTime currentSlot = LocalTime.now().withMinute(0).withSecond(0).withNano(0);
        RideCapacity capacityRecord = capacityRepository.findByRideIdAndTimeSlot(rideId, currentSlot)
                .orElse(null);

        int currentWaitingCount = (capacityRecord != null) ? capacityRecord.getCurrentWaitingCount() : 0;
        int rideCapacity = (ride.getCapacity() != null && ride.getCapacity() > 0) ? ride.getCapacity() : 1;
        
        int turnDurationSeconds = (ride.getDurationSeconds() != null ? ride.getDurationSeconds() : 300) + 120;
        double turnDurationMinutes = turnDurationSeconds / 60.0;

        int turnsNeeded = (int) Math.ceil((double) currentWaitingCount / rideCapacity);
        int estimatedWaitTimeMinutes = (int) Math.ceil(turnsNeeded * turnDurationMinutes);

        Map<String, Object> result = new HashMap<>();
        result.put("rideId", rideId);
        result.put("rideName", ride.getName());
        result.put("status", ride.getStatus());
        result.put("currentWaitingCount", currentWaitingCount);
        result.put("capacityPerTurn", rideCapacity);
        result.put("estimatedWaitTimeMinutes", estimatedWaitTimeMinutes);

        return result;
    }

    // ────────────────────────── MAINTENANCE LOGIC ─────────────────────────

    @Transactional
    public RideMaintenance scheduleMaintenance(Long rideId, LocalDateTime startTime, LocalDateTime endTime, String reason) {
        Ride ride = findById(rideId);
        
        if (startTime.isAfter(endTime)) {
            throw new BusinessException("Thời gian bắt đầu phải trước thời gian kết thúc.");
        }

        RideMaintenance maintenance = RideMaintenance.builder()
                .ride(ride)
                .startTime(startTime)
                .endTime(endTime)
                .reason(reason)
                .status(RideMaintenance.MaintenanceStatus.SCHEDULED)
                .build();

        log.info("[RIDE_MAINTENANCE] Scheduled for rideId={} from {} to {}", rideId, startTime, endTime);
        return maintenanceRepository.save(maintenance);
    }

    /**
     * Scheduler chạy mỗi phút để check bảo trì.
     * Nếu đến giờ bảo trì -> Disable ride.
     * Nếu kết thúc bảo trì -> Enable ride.
     */
    @Scheduled(fixedDelay = 60_000)
    @SchedulerLock(name = "RideService_processAutoMaintenance", lockAtLeastFor = "30s", lockAtMostFor = "2m")
    @Transactional
    public void processAutoMaintenance() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Kích hoạt bảo trì
        List<RideMaintenance> dueMaintenances = maintenanceRepository
                .findByStatusAndStartTimeBefore(RideMaintenance.MaintenanceStatus.SCHEDULED, now);
        
        for (RideMaintenance rm : dueMaintenances) {
            rm.setStatus(RideMaintenance.MaintenanceStatus.IN_PROGRESS);
            maintenanceRepository.save(rm);
            
            Ride ride = rm.getRide();
            if (ride.getStatus() != Ride.RideStatus.CLOSED) {
                ride.setStatus(Ride.RideStatus.MAINTENANCE);
                rideRepository.save(ride);
                log.info("[RIDE_STATUS_AUTO] Ride {} set to MAINTENANCE due to schedule {}", ride.getId(), rm.getId());
            }
        }

        // 2. Kết thúc bảo trì
        List<RideMaintenance> completedMaintenances = maintenanceRepository
                .findByStatusAndEndTimeBefore(RideMaintenance.MaintenanceStatus.IN_PROGRESS, now);
        
        for (RideMaintenance rm : completedMaintenances) {
            rm.setStatus(RideMaintenance.MaintenanceStatus.COMPLETED);
            maintenanceRepository.save(rm);
            
            Ride ride = rm.getRide();
            ride.setStatus(Ride.RideStatus.ACTIVE);
            rideRepository.save(ride);
            log.info("[RIDE_STATUS_AUTO] Ride {} set to ACTIVE as maintenance {} completed", ride.getId(), rm.getId());
        }
    }

    // ────────────────────────── SCHEDULE LOGIC ────────────────────────────

    @Transactional(readOnly = true)
    public List<RideSchedule> getSchedules(Long rideId) {
        findById(rideId);
        return scheduleRepository.findByRideIdAndShiftDate(rideId, null);
    }

    @Transactional
    public RideSchedule createSchedule(Long rideId, RideSchedule schedule) {
        Ride ride = findById(rideId);
        schedule.setRide(ride);
        return scheduleRepository.save(schedule);
    }

    // ──────────────────────────── RIDE USAGE ─────────────────────────────

    @Transactional
    public void recordRideUsage(Long rideId, Long userId, Integer duration, String zone) {
        Ride ride = findById(rideId);
        
        analyticsEventPublisher.publish(
                AnalyticsEvent.EventType.RIDE_USED,
                userId,
                "Ride",
                rideId,
                null,
                Map.of(
                        "rideId", rideId,
                        "duration", duration != null ? duration : 0,
                        "zone", zone != null ? zone : ride.getZone().getName()
                )
        );
        log.info("[RIDE USED] rideId={} userId={}", rideId, userId);
    }
}
