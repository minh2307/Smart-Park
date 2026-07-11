package com.smartpark.domain.park.repository;

import com.smartpark.domain.park.entity.Park;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkRepository extends JpaRepository<Park, Long> {
    Optional<Park> findByCode(String code);
    List<Park> findByStatus(Park.ParkStatus status);
    boolean existsByCode(String code);
}
