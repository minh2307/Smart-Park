package com.smartpark.domain.incident.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.incident.entity.Incident;
import com.smartpark.domain.incident.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock private IncidentRepository incidentRepository;
    @InjectMocks private IncidentService incidentService;

    private Incident incident;

    @BeforeEach
    void setUp() {
        incident = new Incident();
        incident.setId(1L);
        incident.setSeverity(Incident.IncidentSeverity.HIGH);
        incident.setReporterId(1L);
        incident.setDescription("Please clean");
        incident.setStatus(Incident.IncidentStatus.OPEN);
    }

    @Test
    void findAll_ShouldReturnPage() {
        when(incidentRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(incident)));
        Page<Incident> result = incidentService.findAll(PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void create_ShouldSaveIncident() {
        when(incidentRepository.save(any())).thenReturn(incident);
        Incident result = incidentService.create(incident);
        assertThat(result.getDescription()).isEqualTo("Please clean");
    }

    @Test
    void updateStatus_ShouldUpdate_WhenExists() {
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any())).thenReturn(incident);

        Incident result = incidentService.updateStatus(1L, Incident.IncidentStatus.RESOLVED);
        assertThat(result.getStatus()).isEqualTo(Incident.IncidentStatus.RESOLVED);
    }

    @Test
    void updateStatus_ShouldThrow_WhenNotFound() {
        when(incidentRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> incidentService.updateStatus(1L, Incident.IncidentStatus.RESOLVED))
                .isInstanceOf(BusinessException.class);
    }
}
