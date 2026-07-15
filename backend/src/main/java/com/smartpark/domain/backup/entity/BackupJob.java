package com.smartpark.domain.backup.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "backup_jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BackupJob {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 32) private String jobId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private BackupType backupType;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private BackupTarget target;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private BackupStatus status;
    @Column(length = 500) private String reason;
    @Column(nullable = false) private Long requestedBy;
    @Column(nullable = false) private LocalDateTime requestedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    @Column(length = 500) private String storageLocationReference;
    @Column(length = 128) private String checksum;
    @Column(length = 1000) private String failureReason;
    @Version private long version;

    public enum BackupType { FULL, INCREMENTAL }
    public enum BackupTarget { MYSQL, CONFIGURATION, AUDIT, ALL }
    public enum BackupStatus { QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED }
}
