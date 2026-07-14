package com.smartpark.domain.locker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "locker_maintenances")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locker_id", nullable = false)
    private Locker locker;

    @Column(name = "maintenance_date", nullable = false)
    private LocalDateTime maintenanceDate;

    @Column(name = "reason")
    private String reason;

    @Column(name = "technician")
    private String technician;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_status", nullable = false, length = 50)
    @Builder.Default
    private MaintenanceStatus maintenanceStatus = MaintenanceStatus.SCHEDULED;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MaintenanceStatus { SCHEDULED, IN_PROGRESS, COMPLETED }
}
