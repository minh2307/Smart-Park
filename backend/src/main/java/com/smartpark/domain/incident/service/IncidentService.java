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
import com.smartpark.domain.incident.mapper.IncidentMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentHistoryRepository historyRepository;
    private final ZoneRepository zoneRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin tài khoản đăng nhập hiện tại: " + username));
    }

    private Employee getCurrentEmployee(User user) {
        return employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Tài khoản của bạn chưa liên kết với thông tin Nhân viên"));
    }

    @Transactional(readOnly = true)
    public Page<IncidentDto.Response> findAllIncidents(
            String search,
            IncidentStatus status,
            IncidentSeverity severity,
            Long zoneId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        Specification<Incident> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("incidentNumber")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("resolutionDetails")), pattern)
                ));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (severity != null) {
                predicates.add(cb.equal(root.get("severity"), severity));
            }

            if (zoneId != null) {
                predicates.add(cb.equal(root.get("zone").get("id"), zoneId));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return incidentRepository.findAll(spec, pageable)
                .map(inc -> {
                    List<IncidentHistory> hist = historyRepository.findByIncidentIdOrderByCreatedAtDesc(inc.getId());
                    return IncidentMapper.toResponseDto(inc, hist);
                });
    }

    @Transactional(readOnly = true)
    public IncidentDto.Response findIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", id));
        List<IncidentHistory> hist = historyRepository.findByIncidentIdOrderByCreatedAtDesc(id);
        return IncidentMapper.toResponseDto(incident, hist);
    }

    @Transactional
    public IncidentDto.Response createIncident(IncidentDto.CreateRequest request) {
        User user = getCurrentUser();
        Employee employee = getCurrentEmployee(user);

        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone", request.getZoneId()));

        String incidentNumber = "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Incident incident = Incident.builder()
                .incidentNumber(incidentNumber)
                .zone(zone)
                .reporterId(employee.getId())
                .description(request.getDescription())
                .severity(request.getSeverity())
                .status(IncidentStatus.OPEN)
                .build();

        Incident saved = incidentRepository.save(incident);

        // Record history
        IncidentHistory hist = IncidentHistory.builder()
                .incident(saved)
                .statusFrom(null)
                .statusTo(IncidentStatus.OPEN.name())
                .actionDetails("Sự cố được báo cáo mới bởi " + employee.getFullName())
                .performedBy(user)
                .build();
        historyRepository.save(hist);

        // BR-INC-01: Critical incidents trigger alarms & managers SMS notifications
        if (request.getSeverity() == IncidentSeverity.CRITICAL) {
            triggerCriticalAlarm(saved);
        }

        return IncidentMapper.toResponseDto(saved, List.of(hist));
    }

    private void triggerCriticalAlarm(Incident incident) {
        log.warn("🚨 [ALARM CRITICAL] Kích hoạt còi báo động khẩn cấp tại Zone ID={}! Mô tả: {}",
                incident.getZone().getId(), incident.getDescription());
        log.info("📱 [SMS NOTIFICATION] Gửi tin nhắn khẩn cấp (SMS) đến toàn bộ Ban Quản Lý về sự cố khẩn cấp {}",
                incident.getIncidentNumber());
    }

    @Transactional
    public IncidentDto.Response updateIncident(Long id, IncidentDto.UpdateRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", id));

        if (incident.getStatus() == IncidentStatus.CLOSED) {
            throw new BusinessException("Sự cố đã được giải quyết và đóng trước đó.");
        }

        if (request.getZoneId() != null) {
            Zone zone = zoneRepository.findById(request.getZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Zone", request.getZoneId()));
            incident.setZone(zone);
        }
        if (request.getDescription() != null) {
            incident.setDescription(request.getDescription());
        }
        if (request.getSeverity() != null) {
            incident.setSeverity(request.getSeverity());
        }
        if (request.getResolutionDetails() != null) {
            incident.setResolutionDetails(request.getResolutionDetails());
        }

        Incident saved = incidentRepository.save(incident);
        List<IncidentHistory> hist = historyRepository.findByIncidentIdOrderByCreatedAtDesc(id);
        return IncidentMapper.toResponseDto(saved, hist);
    }

    @Transactional
    public IncidentDto.Response startInvestigation(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", id));

        if (incident.getStatus() != IncidentStatus.OPEN) {
            throw new BusinessException("Sự cố không ở trạng thái mở để tiến hành điều tra.");
        }

        User user = getCurrentUser();
        String oldStatus = incident.getStatus().name();
        incident.setStatus(IncidentStatus.INVESTIGATING);
        Incident saved = incidentRepository.save(incident);

        IncidentHistory hist = IncidentHistory.builder()
                .incident(saved)
                .statusFrom(oldStatus)
                .statusTo(IncidentStatus.INVESTIGATING.name())
                .actionDetails("Bắt đầu tiến hành điều tra hiện trường sự cố.")
                .performedBy(user)
                .build();
        historyRepository.save(hist);

        List<IncidentHistory> histList = historyRepository.findByIncidentIdOrderByCreatedAtDesc(id);
        return IncidentMapper.toResponseDto(saved, histList);
    }

    @Transactional
    public IncidentDto.Response resolveIncident(Long id, IncidentDto.ResolveRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", id));

        if (incident.getStatus() == IncidentStatus.RESOLVED || incident.getStatus() == IncidentStatus.CLOSED) {
            throw new BusinessException("Sự cố đã hoàn thành giải quyết hoặc đóng trước đó.");
        }

        User user = getCurrentUser();

        // Business Rule: Critical incidents require manager approval before closing/resolving
        if (incident.getSeverity() == IncidentSeverity.CRITICAL) {
            boolean isManager = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") || auth.getAuthority().equals("ROLE_SAFETY_MANAGER") || auth.getAuthority().equals("ROLE_PARK_MANAGER"));
            if (!isManager) {
                throw new BusinessException("Sự cố nghiêm trọng (CRITICAL) yêu cầu sự phê duyệt của Ban quản lý (Manager/Admin) để đóng hoặc giải quyết.");
            }
        }

        String oldStatus = incident.getStatus().name();
        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolutionDetails(request.getResolutionDetails());
        Incident saved = incidentRepository.save(incident);

        IncidentHistory hist = IncidentHistory.builder()
                .incident(saved)
                .statusFrom(oldStatus)
                .statusTo(IncidentStatus.RESOLVED.name())
                .actionDetails("Khắc phục sự cố hoàn tất: " + request.getResolutionDetails())
                .performedBy(user)
                .build();
        historyRepository.save(hist);

        List<IncidentHistory> histList = historyRepository.findByIncidentIdOrderByCreatedAtDesc(id);
        return IncidentMapper.toResponseDto(saved, histList);
    }

    @Transactional(readOnly = true)
    public IncidentDto.StatsResponse getIncidentStatistics() {
        long total = incidentRepository.count();
        long open = incidentRepository.count((root, query, cb) -> cb.equal(root.get("status"), IncidentStatus.OPEN));
        long investigating = incidentRepository.count((root, query, cb) -> cb.equal(root.get("status"), IncidentStatus.INVESTIGATING));
        long resolved = incidentRepository.count((root, query, cb) -> cb.equal(root.get("status"), IncidentStatus.RESOLVED));
        long closed = incidentRepository.count((root, query, cb) -> cb.equal(root.get("status"), IncidentStatus.CLOSED));

        Map<String, Long> severityBreakdown = new HashMap<>();
        for (IncidentSeverity s : IncidentSeverity.values()) {
            long count = incidentRepository.count((root, query, cb) -> cb.equal(root.get("severity"), s));
            severityBreakdown.put(s.name(), count);
        }

        // Compute average resolution time in minutes
        List<Incident> resolvedIncidents = incidentRepository.findAll((root, query, cb) -> cb.or(
                cb.equal(root.get("status"), IncidentStatus.RESOLVED),
                cb.equal(root.get("status"), IncidentStatus.CLOSED)
        ));

        double averageTimeMinutes = 0.0;
        if (!resolvedIncidents.isEmpty()) {
            long totalMinutes = 0;
            int count = 0;
            for (Incident inc : resolvedIncidents) {
                // Find completion date/time from history
                List<IncidentHistory> histList = historyRepository.findByIncidentIdOrderByCreatedAtDesc(inc.getId());
                LocalDateTime resolvedTime = histList.stream()
                        .filter(h -> h.getStatusTo().equals(IncidentStatus.RESOLVED.name()) || h.getStatusTo().equals(IncidentStatus.CLOSED.name()))
                        .map(IncidentHistory::getCreatedAt)
                        .findFirst()
                        .orElse(null);

                if (resolvedTime != null && inc.getCreatedAt() != null) {
                    totalMinutes += Duration.between(inc.getCreatedAt(), resolvedTime).toMinutes();
                    count++;
                }
            }
            averageTimeMinutes = count > 0 ? (double) totalMinutes / count : 0.0;
        }

        return IncidentDto.StatsResponse.builder()
                .totalIncidents(total)
                .openIncidents(open)
                .investigatingIncidents(investigating)
                .resolvedIncidents(resolved)
                .closedIncidents(closed)
                .severityBreakdown(severityBreakdown)
                .averageResolutionTimeMinutes(averageTimeMinutes)
                .build();
    }
}
