package com.smartpark.domain.parking.entity;

import com.smartpark.domain.park.entity.Zone;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng gates - cổng ra/vào công viên/bãi đỗ xe.
 * SRS: BR-GATE-01: gate code phải unique trong toàn hệ thống.
 *      BR-GATE-02: gate thuộc 1 parking area hoặc zone.
 *      BR-GATE-03: gate CLOSED/MAINTENANCE không nhận phương tiện.
 */
@Entity
@Table(name = "gates")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Parking area mà gate thuộc về (có thể null nếu là gate khu vực chung) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_area_id")
    private ParkingLot parkingArea;

    /** Zone thuộc về */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private Zone zone;

    /** BR-GATE-01: Mã cổng duy nhất, ví dụ GATE_MAIN_01 */
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    /** Loại cổng: vào, ra, hoặc hai chiều */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GateType type = GateType.ENTRANCE;

    /** Trạng thái hoạt động */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GateStatus status = GateStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Thông tin thiết bị kết nối (JSON string).
     * Ví dụ: ["Camera LPR", "Barie tự động", "Màn hình LED"]
     */
    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Soft delete: khác null = đã xóa */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum GateType {
        ENTRANCE,       // Chỉ cho vào
        EXIT,           // Chỉ cho ra
        BIDIRECTIONAL   // Hai chiều
    }

    public enum GateStatus {
        OPEN,           // Đang hoạt động bình thường
        CLOSED,         // Đóng cửa
        MAINTENANCE     // Đang bảo trì
    }
}
