package com.smartpark.domain.ride.repository;

import com.smartpark.domain.ride.entity.Ride;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {

    @Override
    @Query(value = "select r from Ride r left join fetch r.zone z left join fetch z.park p left join fetch r.rideCategory c",
           countQuery = "select count(r) from Ride r")
    Page<Ride> findAll(Pageable pageable);

    @Override
    @Query("select r from Ride r left join fetch r.zone z left join fetch z.park p left join fetch r.rideCategory c where r.id = :id")
    Optional<Ride> findById(@Param("id") Long id);

    Optional<Ride> findByCode(String code);
    @Query("select r from Ride r where r.zone.id = :zoneId")
    List<Ride> findByZoneId(@Param("zoneId") Long zoneId);
    List<Ride> findByStatus(Ride.RideStatus status);
    boolean existsByCode(String code);
    long countByStatus(Ride.RideStatus status);

    @Query(value = "SELECT r.id as rideId, r.name as rideName, COUNT(l.id) as validationCount FROM ticket_validation_logs l JOIN rides r ON l.attraction_id = r.id WHERE l.status = 'SUCCESS' AND l.check_in_time BETWEEN :from AND :to GROUP BY r.id, r.name ORDER BY validationCount DESC", nativeQuery = true)
    List<com.smartpark.domain.bi.projection.PopularRideProjection> getPopularRides(@Param("from") java.time.LocalDateTime from, @Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT r.id as rideId, r.name as rideName, COALESCE(AVG(rc.current_waiting_count), 0) as avgQueueLength, r.capacity as rideCapacity, r.duration_seconds as cycleDuration, ROUND((COALESCE(AVG(rc.current_waiting_count), 0) / COALESCE(NULLIF(r.capacity, 0), 1)) * (COALESCE(r.duration_seconds, 0) / 60.0), 1) as estimatedWaitMinutes FROM rides r LEFT JOIN ride_capacities rc ON rc.ride_id = r.id GROUP BY r.id, r.name, r.capacity, r.duration_seconds", nativeQuery = true)
    List<com.smartpark.domain.bi.projection.RideWaitingTimeProjection> getRideWaitingTimes();

    @Query(value = "SELECT r.id as rideId, r.name as rideName, COALESCE(AVG(rc.current_waiting_count), 0) as avgQueueLength, r.capacity as rideCapacity, r.duration_seconds as cycleDuration, ROUND((COALESCE(AVG(rc.current_waiting_count), 0) / COALESCE(NULLIF(r.capacity, 0), 1)) * (COALESCE(r.duration_seconds, 0) / 60.0), 1) as estimatedWaitMinutes FROM rides r LEFT JOIN ride_capacities rc ON rc.ride_id = r.id WHERE r.id = :rideId GROUP BY r.id, r.name, r.capacity, r.duration_seconds", nativeQuery = true)
    Optional<com.smartpark.domain.bi.projection.RideWaitingTimeProjection> getRideWaitingTime(@Param("rideId") Long rideId);
}

