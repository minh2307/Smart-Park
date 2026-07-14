package com.smartpark.domain.ride.repository;

import com.smartpark.domain.ride.entity.RideCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalTime;
import java.util.Optional;

@Repository
public interface RideCapacityRepository extends JpaRepository<RideCapacity, Long> {
    Optional<RideCapacity> findByRideIdAndTimeSlot(Long rideId, LocalTime timeSlot);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT rc FROM RideCapacity rc WHERE rc.ride.id = :rideId AND rc.timeSlot = :timeSlot")
    Optional<RideCapacity> findByRideIdAndTimeSlotForUpdate(Long rideId, LocalTime timeSlot);

    @Query("SELECT COALESCE(SUM(rc.bookedCount), 0), COALESCE(SUM(rc.maxCapacity), 0) FROM RideCapacity rc")
    java.util.List<Object[]> getUtilizationData();

    @Query("SELECT AVG(rc.currentWaitingCount) FROM RideCapacity rc")
    Double getAverageWaitingCount();

    java.util.List<RideCapacity> findByRideId(Long rideId);
}

