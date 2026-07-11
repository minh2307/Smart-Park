package com.smartpark.domain.incident.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.incident.entity.Incident;
import com.smartpark.domain.incident.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;

    @Transactional(readOnly = true)
    public Page<Incident> findAll(Pageable pageable) {
        return incidentRepository.findAll(pageable);
    }

    @Transactional
    public Incident create(Incident incident) {
        return incidentRepository.save(incident);
    }

    @Transactional
    public Incident updateStatus(Long id, Incident.IncidentStatus status) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Sự cố không tồn tại: " + id));
        incident.setStatus(status);
        return incidentRepository.save(incident);
    }
}
