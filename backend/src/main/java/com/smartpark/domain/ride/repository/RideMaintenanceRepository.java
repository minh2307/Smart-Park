package com.smartpark.domain.ride.repository;

import com.smartpark.domain.ride.entity.RideMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideMaintenanceRepository extends JpaRepository<RideMaintenance, Long> {
    List<RideMaintenance> findByRideId(Long rideId);
    List<RideMaintenance> findByStatusAndStartTimeBefore(RideMaintenance.MaintenanceStatus status, LocalDateTime now);
    List<RideMaintenance> findByStatusAndEndTimeBefore(RideMaintenance.MaintenanceStatus status, LocalDateTime now);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COALESCE(SUM(cost), 0) FROM ride_maintenances WHERE status = 'COMPLETED' AND completion_date BETWEEN :from AND :to", nativeQuery = true)
    java.math.BigDecimal sumCostByCompletionDateBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDate from, @org.springframework.data.repository.query.Param("to") java.time.LocalDate to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE(completion_date) as dateVal, SUM(cost) FROM ride_maintenances WHERE status = 'COMPLETED' AND completion_date BETWEEN :from AND :to GROUP BY DATE(completion_date) ORDER BY dateVal ASC", nativeQuery = true)
    List<Object[]> sumDailyMaintenanceCostBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDate from, @org.springframework.data.repository.query.Param("to") java.time.LocalDate to);
}
