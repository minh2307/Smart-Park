package com.smartpark.domain.turnstile.entity;

import com.smartpark.domain.device.entity.IoTDevice;
import com.smartpark.domain.ticket.entity.Ticket;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "turnstile_scan_events", uniqueConstraints =
        @UniqueConstraint(name = "uk_turnstile_device_request", columnNames = {"device_id", "request_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TurnstileScanEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "device_id", nullable = false) private IoTDevice device;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ticket_id") private Ticket ticket;
    @Column(name = "request_id", nullable = false, length = 64) private String requestId;
    @Column(name = "ticket_code", nullable = false, length = 100) private String ticketCode;
    @Column(name = "park_id", nullable = false) private Long parkId;
    @Column(name = "zone_id") private Long zoneId;
    @Column(nullable = false, length = 20) private String decision;
    @Column(nullable = false, length = 20) private String command;
    @Column(name = "ticket_status", length = 30) private String ticketStatus;
    @Column(name = "error_code", length = 40) private String errorCode;
    @Column(length = 255) private String message;
    @Column(name = "scan_time", nullable = false) private LocalDateTime scanTime;
    @Column(name = "processed_at", nullable = false) private LocalDateTime processedAt;
    @Column(name = "latency_ms", nullable = false) private Long latencyMs;
}
