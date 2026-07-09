package com.smartpark.domain.parking.entity;

import com.smartpark.domain.park.entity.Park;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng parking_lots - bãi đỗ xe thông minh.
 * SRS schema: (id, park_id, name, total_spaces, occupied_spaces, status)
 * MODULE 26: BR-PARK-01: mở barie bằng LPR trong vòng 1 giây.
 */
@Entity
@Table(name = "parking_lots")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParkingLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "park_id", nullable = false)
    private Park park;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "total_spaces", nullable = false)
    private Integer totalSpaces;

    @Column(name = "occupied_spaces", nullable = false)
    @Builder.Default
    private Integer occupiedSpaces = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParkingLotStatus status = ParkingLotStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ParkingLotStatus { ACTIVE, FULL, CLOSED }
}
