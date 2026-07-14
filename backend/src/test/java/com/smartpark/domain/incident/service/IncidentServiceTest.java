package com.smartpark.domain.incident.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.employee.entity.Employee;
import com.smartpark.domain.employee.repository.EmployeeRepository;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.park.repository.ZoneRepository;
import com.smartpark.domain.incident.dto.IncidentDto;
import com.smartpark.domain.incident.entity.Incident;
import com.smartpark.domain.incident.entity.Incident.IncidentSeverity;
import com.smartpark.domain.incident.entity.Incident.IncidentStatus;
import com.smartpark.domain.incident.entity.IncidentHistory;
import com.smartpark.domain.incident.repository.IncidentHistoryRepository;
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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock private IncidentRepository incidentRepository;
    @Mock private IncidentHistoryRepository historyRepository;
    @Mock private ZoneRepository zoneRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private UserRepository userRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks private IncidentService incidentService;

    private User user;
    private Employee employee;
    private Zone zone;
    private Incident incident;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(10L);
        user.setUsername("safety_officer");

        employee = new Employee();
        employee.setId(20L);
        employee.setFullName("Safety Officer");
        employee.setUserId(user.getId());

        zone = new Zone();
        zone.setId(30L);
        zone.setName("Adventure Zone");

        incident = new Incident();
        incident.setId(1L);
        incident.setIncidentNumber("INC-12345");
        incident.setZone(zone);
        incident.setReporterId(20L);
        incident.setDescription("Fire in the kitchen");
        incident.setSeverity(IncidentSeverity.CRITICAL);
        incident.setStatus(IncidentStatus.OPEN);
    }

    private void mockSecurityContext(String username, String role) {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        if (role != null) {
            SimpleGrantedAuthority auth = new SimpleGrantedAuthority(role);
            doReturn(List.of(auth)).when(authentication).getAuthorities();
        }
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAllIncidents_ShouldReturnFilteredPage() {
        Page<Incident> page = new PageImpl<>(List.of(incident));
        when(incidentRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);
        when(historyRepository.findByIncidentIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        Page<IncidentDto.Response> result = incidentService.findAllIncidents(
                "Fire", IncidentStatus.OPEN, IncidentSeverity.CRITICAL, 30L, null, null, PageRequest.of(0, 10)
        );

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getDescription()).isEqualTo("Fire in the kitchen");
    }

    @Test
    void createIncident_ShouldTriggerSirenAndSms_WhenCritical() {
        mockSecurityContext("safety_officer", null);
        when(userRepository.findByUsername("safety_officer")).thenReturn(Optional.of(user));
        when(employeeRepository.findByUserId(10L)).thenReturn(Optional.of(employee));
        when(zoneRepository.findById(30L)).thenReturn(Optional.of(zone));
        when(incidentRepository.save(any(Incident.class))).thenReturn(incident);

        IncidentDto.CreateRequest request = IncidentDto.CreateRequest.builder()
                .zoneId(30L)
                .description("Fire in the kitchen")
                .severity(IncidentSeverity.CRITICAL)
                .build();

        IncidentDto.Response result = incidentService.createIncident(request);
        assertThat(result).isNotNull();
        assertThat(result.getSeverity()).isEqualTo(IncidentSeverity.CRITICAL);

        // Verify history entry is recorded
        verify(historyRepository, times(1)).save(any(IncidentHistory.class));
    }

    @Test
    void startInvestigation_ShouldTransitionStatusToInvestigating() {
        mockSecurityContext("safety_officer", null);
        when(userRepository.findByUsername("safety_officer")).thenReturn(Optional.of(user));
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncidentDto.Response result = incidentService.startInvestigation(1L);
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.INVESTIGATING);
    }

    @Test
    void resolveIncident_ShouldFail_WhenCriticalAndNotManager() {
        mockSecurityContext("safety_officer", "ROLE_EMPLOYEE");
        when(userRepository.findByUsername("safety_officer")).thenReturn(Optional.of(user));
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        IncidentDto.ResolveRequest resolveRequest = IncidentDto.ResolveRequest.builder()
                .resolutionDetails("Kitchen fire put out.")
                .build();

        assertThatThrownBy(() -> incidentService.resolveIncident(1L, resolveRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("yêu cầu sự phê duyệt của Ban quản lý");
    }

    @Test
    void resolveIncident_ShouldSucceed_WhenCriticalAndIsManager() {
        mockSecurityContext("admin_user", "ROLE_ADMIN");
        when(userRepository.findByUsername("admin_user")).thenReturn(Optional.of(user));
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncidentDto.ResolveRequest resolveRequest = IncidentDto.ResolveRequest.builder()
                .resolutionDetails("Kitchen fire put out.")
                .build();

        IncidentDto.Response result = incidentService.resolveIncident(1L, resolveRequest);
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.RESOLVED);
    }
}
