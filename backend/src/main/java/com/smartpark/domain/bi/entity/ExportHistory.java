package com.smartpark.domain.bi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "export_history")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_history_id")
    private ReportHistory reportHistory;

    @Column(name = "export_format", nullable = false, length = 10)
    private String exportFormat;

    @CreatedDate
    @Column(name = "exported_at", updatable = false)
    private LocalDateTime exportedAt;

    @Column(name = "exported_by", length = 100)
    private String exportedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExportStatus status;

    @Column(name = "download_url")
    private String downloadUrl;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    public enum ExportStatus {
        PENDING,
        COMPLETED,
        FAILED
    }
}
