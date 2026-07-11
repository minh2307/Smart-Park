package com.smartpark.domain.locker.repository;

import com.smartpark.domain.locker.entity.Locker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LockerRepository extends JpaRepository<Locker, Long> {
    Optional<Locker> findByLockerCode(String lockerCode);
    List<Locker> findByZoneIdAndStatus(Long zoneId, Locker.LockerStatus status);
}
