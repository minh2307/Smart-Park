package com.smartpark.domain.parking.entity;

import com.smartpark.domain.park.entity.Park;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bảng parking_lots - bãi đỗ xe thông minh (ParkingArea).
 * SRS schema: (id, park_id, name, vehicle_type, total_spaces, occupied_spaces,
 *              hourly_rate, daily_rate, status, description, created_at, updated_at, deleted_at)
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

    /** Loại phương tiện được phép vào bãi */
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    @Builder.Default
    private VehicleType vehicleType = VehicleType.ALL;

    @Column(name = "total_spaces", nullable = false)
    private Integer totalSpaces;

    @Column(name = "occupied_spaces", nullable = false)
    @Builder.Default
    private Integer occupiedSpaces = 0;

    /** Giá theo giờ (VND) */
    @Column(name = "hourly_rate", precision = 15, scale = 2)
    private BigDecimal hourlyRate;

    /** Giá theo ngày (VND) */
    @Column(name = "daily_rate", precision = 15, scale = 2)
    private BigDecimal dailyRate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParkingLotStatus status = ParkingLotStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Soft delete: khác null = đã xóa */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum ParkingLotStatus { ACTIVE, FULL, CLOSED }
    public enum VehicleType { MOTORBIKE, CAR, TRUCK, ALL }
}
