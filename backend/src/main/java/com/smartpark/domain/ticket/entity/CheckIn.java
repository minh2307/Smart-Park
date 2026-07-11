package com.smartpark.domain.ticket.entity;

import com.smartpark.domain.park.entity.Zone;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Bảng check_ins - ghi nhận lượt quét vé vào cổng soát vé.
 * SRS schema: (id, ticket_id, zone_id, scanner_id, check_time)
 * MODULE 16: Khách quét vé QR tại cổng → trạng thái UNUSED → USED.
 * NFR-PERF-01: thời gian xử lý dưới 150ms với Redis cache.
 */
@Entity
@Table(name = "check_ins")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private Zone zone;

    /** ID thiết bị quét (turnstile scanner device ID) */
    @Column(name = "scanner_id", length = 50)
    private String scannerId;

    /** Thời điểm check-in (alias checkTime trong DB) */
    @Column(name = "check_time", nullable = false)
    private LocalDateTime checkInTime;
}

