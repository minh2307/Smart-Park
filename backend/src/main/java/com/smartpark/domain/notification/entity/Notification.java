package com.smartpark.domain.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng notifications - thông báo hệ thống gửi đến người dùng.
 * SRS schema: (id, user_id, title, content, type, status, created_at)
 * MODULE 29: Gửi OTP, hóa đơn, cảnh báo bảo trì qua Email/SMS/Firebase Push.
 */
@Entity
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID tài khoản người nhận (references users table) */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /** Kênh gửi thông báo */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.PENDING;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType { EMAIL, SMS, PUSH, IN_APP }
    public enum NotificationStatus { PENDING, SENT, FAILED, READ }
}
