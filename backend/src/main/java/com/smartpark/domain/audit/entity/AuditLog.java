package com.smartpark.domain.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng audit_logs - nhật ký hệ thống bất biến ghi toàn bộ thao tác CUD.
 * SRS schema: (id, user_id, action, target_table, record_id, old_values, new_values, ip_address, created_at)
 * MODULE 31: BR-AUD-01: bảng này chỉ được phép INSERT, không cho phép UPDATE hoặc DELETE
 *            ở tầng database (áp dụng database-level permission).
 */
@Entity
@Table(name = "audit_logs")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID tài khoản thực hiện hành động (references users table) */
    @Column(name = "user_id")
    private Long userId;

    /** Loại hành động: CREATE, UPDATE, DELETE */
    @Column(nullable = false, length = 20)
    private String action;

    /** Logical API/domain resource affected by the operation. */
    @Column(length = 100)
    private String resource;

    /** Tên bảng bị tác động */
    @Column(name = "target_table", nullable = false, length = 100)
    private String targetTable;

    /** ID bản ghi bị tác động trong bảng tương ứng */
    @Column(name = "record_id")
    private Long recordId;

    /** Giá trị cũ trước khi thay đổi (JSON format) */
    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;

    /** Giá trị mới sau khi thay đổi (JSON format) */
    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(length = 20)
    private String result;

    @Column(name = "correlation_id", length = 64)
    private String correlationId;

    /** BR-AUD-01: chỉ INSERT, không UPDATE/DELETE */
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @PreUpdate
    @PreRemove
    private void rejectMutation() {
        throw new IllegalStateException("Audit records are immutable");
    }
}
