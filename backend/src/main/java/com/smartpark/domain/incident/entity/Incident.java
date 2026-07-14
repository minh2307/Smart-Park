package com.smartpark.domain.incident.entity;

import com.smartpark.domain.park.entity.Zone;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng incidents - sự cố an ninh và an toàn xảy ra tại khu vui chơi.
 * SRS schema: (id, zone_id, reporter_id, description, severity, status, resolution_details, created_at)
 * MODULE 30: BR-INC-01: cảnh báo CRITICAL phải kích hoạt còi báo động và gửi SMS ban quản lý.
 */
@Entity
@Table(name = "incidents")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_number", unique = true, length = 50)
    private String incidentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    /** ID nhân viên báo cáo sự cố (references employees table) */
    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /**
     * BR-INC-01: CRITICAL → kích hoạt còi báo động + gửi SMS đến toàn bộ ban quản lý.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.OPEN;

    @Column(name = "resolution_details", columnDefinition = "TEXT")
    private String resolutionDetails;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum IncidentSeverity { LOW, MEDIUM, HIGH, CRITICAL }
    public enum IncidentStatus { OPEN, INVESTIGATING, RESOLVED, CLOSED }
}
