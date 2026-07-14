package com.smartpark.domain.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "push_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PushHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_token", nullable = false, length = 255)
    private String deviceToken;

    @Column(length = 100)
    private String topic;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "send_status", nullable = false)
    @Builder.Default
    private SendStatus sendStatus = SendStatus.PENDING;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public enum SendStatus { PENDING, SENT, FAILED }
}
