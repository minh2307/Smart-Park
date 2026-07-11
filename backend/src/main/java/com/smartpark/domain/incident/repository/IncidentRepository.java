package com.smartpark.domain.incident.repository;

import com.smartpark.domain.incident.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByZoneId(Long zoneId);
    List<Incident> findByStatus(Incident.IncidentStatus status);
    List<Incident> findBySeverity(Incident.IncidentSeverity severity);
    long countByCreatedAtBetween(java.time.LocalDateTime from, java.time.LocalDateTime to);
}
