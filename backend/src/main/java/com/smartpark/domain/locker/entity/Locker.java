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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LockerSize size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LockerStatus status = LockerStatus.AVAILABLE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum LockerSize { SMALL, MEDIUM, LARGE }
    public enum LockerStatus { AVAILABLE, OCCUPIED, OUT_OF_ORDER }
}
