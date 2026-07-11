package com.smartpark.domain.park.repository;

import com.smartpark.domain.park.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    List<Zone> findByParkId(Long parkId);
    List<Zone> findByParkIdAndStatus(Long parkId, Zone.ZoneStatus status);
    boolean existsByCode(String code);
}
