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
}
