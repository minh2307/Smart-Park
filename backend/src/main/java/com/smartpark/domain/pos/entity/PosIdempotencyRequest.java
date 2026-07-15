package com.smartpark.domain.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pos_idempotency_requests", uniqueConstraints =
        @UniqueConstraint(name = "uk_pos_idempotency_scope_key", columnNames = {"scope", "idempotency_key"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PosIdempotencyRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 30)
    private String scope;
    @Column(name = "idempotency_key", nullable = false, length = 100)
    private String idempotencyKey;
    @Column(name = "request_hash", nullable = false, length = 64)
    private String requestHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private RequestStatus status;
    @Column(name = "response_json", columnDefinition = "TEXT")
    private String responseJson;
    @Column(name = "resource_id")
    private Long resourceId;
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    public enum RequestStatus { PROCESSING, COMPLETED, FAILED }
}
