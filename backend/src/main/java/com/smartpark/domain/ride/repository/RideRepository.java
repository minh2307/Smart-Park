package com.smartpark.domain.ride.repository;

import com.smartpark.domain.ride.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    Optional<Ride> findByCode(String code);
    List<Ride> findByZoneId(Long zoneId);
    List<Ride> findByStatus(Ride.RideStatus status);
    boolean existsByCode(String code);
    long countByStatus(Ride.RideStatus status);
}
