package com.smartpark.domain.ride.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RideServiceTest {

    @Mock private RideRepository rideRepository;
    @Mock private RideScheduleRepository scheduleRepository;
    @Mock private ZoneRepository zoneRepository;
    @Mock private RideMaintenanceRepository maintenanceRepository;
    @Mock private RideCapacityRepository capacityRepository;
    @Mock private AnalyticsEventPublisher analyticsEventPublisher;

    @InjectMocks
    private RideService rideService;

    private Ride ride;
    private Zone zone;

    @BeforeEach
    void setUp() {
        zone = new Zone();
        zone.setId(1L);
        zone.setName("Zone A");

        ride = new Ride();
        ride.setId(1L);
        ride.setCode("RIDE_01");
        ride.setName("Roller Coaster");
        ride.setCapacity(20);
        ride.setDurationSeconds(300);
        ride.setStatus(Ride.RideStatus.ACTIVE);
        ride.setZone(zone);
    }

    @Test
    void findAll_ShouldReturnPageOfRides() {
        Page<Ride> page = new PageImpl<>(List.of(ride));
        when(rideRepository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<Ride> result = rideService.findAll(PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void findById_ShouldReturnRide_WhenExists() {
        when(rideRepository.findById(1L)).thenReturn(Optional.of(ride));
        Ride result = rideService.findById(1L);
        assertThat(result.getName()).isEqualTo("Roller Coaster");
    }

    @Test
    void findById_ShouldThrow_WhenNotExists() {
        when(rideRepository.findById(2L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> rideService.findById(2L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_ShouldSaveRide_WhenValid() {
        when(zoneRepository.findById(1L)).thenReturn(Optional.of(zone));
        when(rideRepository.existsByCode("RIDE_01")).thenReturn(false);
        when(rideRepository.save(any(Ride.class))).thenReturn(ride);

        Ride result = rideService.create(1L, ride);
        assertThat(result).isNotNull();
        verify(rideRepository).save(ride);
    }

    @Test
    void create_ShouldThrow_WhenZoneNotFound() {
        when(zoneRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> rideService.create(1L, ride))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_ShouldThrow_WhenCodeExists() {
        when(zoneRepository.findById(1L)).thenReturn(Optional.of(zone));
        when(rideRepository.existsByCode("RIDE_01")).thenReturn(true);
        assertThatThrownBy(() -> rideService.create(1L, ride))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void updateStatus_ShouldUpdate() {
        when(rideRepository.findById(1L)).thenReturn(Optional.of(ride));
        when(rideRepository.save(any(Ride.class))).thenReturn(ride);

        Ride result = rideService.updateStatus(1L, Ride.RideStatus.MAINTENANCE);
        assertThat(result.getStatus()).isEqualTo(Ride.RideStatus.MAINTENANCE);
    }

    @Test
    void getQueueInfo_ShouldCalculateWaitTime() {
        when(rideRepository.findById(1L)).thenReturn(Optional.of(ride));
        RideCapacity capacity = new RideCapacity();
        capacity.setCurrentWaitingCount(45);
        when(capacityRepository.findByRideIdAndTimeSlot(eq(1L), any(LocalTime.class)))
                .thenReturn(Optional.of(capacity));

        // 45 waiting, capacity=20 -> 3 turns needed
        // turn duration = 300 + 120 = 420s = 7 minutes
        // Wait time = 3 * 7 = 21 minutes
        Map<String, Object> result = rideService.getQueueInfo(1L);
        assertThat(result.get("estimatedWaitTimeMinutes")).isEqualTo(21);
    }

    @Test
    void scheduleMaintenance_ShouldSave() {
        when(rideRepository.findById(1L)).thenReturn(Optional.of(ride));
        RideMaintenance rm = new RideMaintenance();
        when(maintenanceRepository.save(any(RideMaintenance.class))).thenReturn(rm);

        LocalDateTime now = LocalDateTime.now();
        RideMaintenance result = rideService.scheduleMaintenance(1L, now.plusHours(1), now.plusHours(3), "Fix");
        assertThat(result).isNotNull();
        verify(maintenanceRepository).save(any());
    }

    @Test
    void processAutoMaintenance_ShouldStartAndComplete() {
        RideMaintenance startRm = new RideMaintenance();
        startRm.setRide(ride);
        startRm.setStatus(RideMaintenance.MaintenanceStatus.SCHEDULED);

        RideMaintenance endRm = new RideMaintenance();
        Ride ride2 = new Ride();
        ride2.setId(2L);
        endRm.setRide(ride2);
        endRm.setStatus(RideMaintenance.MaintenanceStatus.IN_PROGRESS);

        when(maintenanceRepository.findByStatusAndStartTimeBefore(
                eq(RideMaintenance.MaintenanceStatus.SCHEDULED), any(LocalDateTime.class)))
                .thenReturn(List.of(startRm));
        when(maintenanceRepository.findByStatusAndEndTimeBefore(
                eq(RideMaintenance.MaintenanceStatus.IN_PROGRESS), any(LocalDateTime.class)))
                .thenReturn(List.of(endRm));

        rideService.processAutoMaintenance();

        verify(maintenanceRepository, times(2)).save(any());
        verify(rideRepository, times(2)).save(any());
        assertThat(startRm.getStatus()).isEqualTo(RideMaintenance.MaintenanceStatus.IN_PROGRESS);
        assertThat(ride.getStatus()).isEqualTo(Ride.RideStatus.MAINTENANCE);
    }

    @Test
    void recordRideUsage_ShouldPublishEvent() {
        when(rideRepository.findById(1L)).thenReturn(Optional.of(ride));
        rideService.recordRideUsage(1L, 100L, 10, "Zone A");

        verify(analyticsEventPublisher).publish(
                eq(AnalyticsEvent.EventType.RIDE_USED),
                eq(100L),
                eq("Ride"),
                eq(1L),
                isNull(),
                anyMap()
        );
    }
}
