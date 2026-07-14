package com.smartpark.domain.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String recipient;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(name = "html_content", nullable = false, columnDefinition = "TEXT")
    private String htmlContent;

    @Column(name = "attachment_path", length = 255)
    private String attachmentPath;

    @Enumerated(EnumType.STRING)
    @Column(name = "send_status", nullable = false)
    @Builder.Default
    private SendStatus sendStatus = SendStatus.PENDING;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private int retryCount = 0;

    public enum SendStatus { PENDING, SENT, FAILED }
}
