package com.smartpark.domain.locker.repository;

import com.smartpark.domain.locker.entity.LockerMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LockerMaintenanceRepository extends JpaRepository<LockerMaintenance, Long>, JpaSpecificationExecutor<LockerMaintenance> {
    List<LockerMaintenance> findByLockerIdAndMaintenanceStatus(Long lockerId, LockerMaintenance.MaintenanceStatus status);
    Optional<LockerMaintenance> findFirstByLockerIdAndMaintenanceStatus(Long lockerId, LockerMaintenance.MaintenanceStatus status);
}
