package com.smartpark.domain.ride.repository;

import com.smartpark.domain.ride.entity.RideSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RideScheduleRepository extends JpaRepository<RideSchedule, Long> {
    List<RideSchedule> findByRideIdAndShiftDate(Long rideId, LocalDate date);
    List<RideSchedule> findByEmployeeId(Long employeeId);
}
