package com.smartpark.domain.device.entity;

import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.parking.entity.Gate;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "iot_devices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IoTDevice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_code", nullable = false, unique = true, length = 80)
    private String deviceCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false, length = 30)
    private DeviceType deviceType;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "park_id", nullable = false)
    private Park park;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "zone_id")
    private Zone zone;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "gate_id")
    private Gate gate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeviceStatus status;

    @Column(name = "credential_hash", nullable = false, length = 255)
    private String credentialHash;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version private Long version;

    @PrePersist void create() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate void update() { updatedAt = LocalDateTime.now(); }

    public enum DeviceType { TURNSTILE, LPR_CAMERA }
    public enum DeviceStatus { ACTIVE, INACTIVE, REVOKED }
}
