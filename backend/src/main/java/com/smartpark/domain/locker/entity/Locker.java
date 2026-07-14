package com.smartpark.domain.locker.entity;

import com.smartpark.domain.park.entity.Zone;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng lockers - tủ đồ thông minh tại các phân khu.
 * SRS schema: (id, zone_id, locker_code, size, status)
 * MODULE 27: Khách thuê tủ qua mã QR trên thiết bị di động, khóa từ tự động.
 */
@Entity
@Table(name = "lockers")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Locker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @Column(name = "locker_code", unique = true, nullable = false, length = 20)
    private String lockerCode;

    @Column(name = "locker_number", unique = true, nullable = false, length = 50)
    private String lockerNumber;

    @Column(name = "type", nullable = false, length = 50)
    @Builder.Default
    private String type = "STANDARD";

    @Column(name = "rental_price", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private java.math.BigDecimal rentalPrice = java.math.BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LockerSize size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LockerStatus status = LockerStatus.AVAILABLE;

    @Column(name = "location")
    private String location;

    @Column(name = "qr_code")
    private String qrCode;

    @Column(name = "current_availability", nullable = false)
    @Builder.Default
    private Boolean currentAvailability = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @org.springframework.data.annotation.LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum LockerSize { SMALL, MEDIUM, LARGE, FAMILY, VIP }
    public enum LockerStatus { AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE, LOCKED, OUT_OF_SERVICE, CLEANING, DISABLED }
}
