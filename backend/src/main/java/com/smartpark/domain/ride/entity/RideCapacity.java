package com.smartpark.domain.ride.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

/**
 * Bảng ride_capacities - theo dõi sức chứa và hàng đợi theo khung giờ.
 * SRS schema: (id, ride_id, time_slot, max_capacity, booked_count, current_waiting_count)
 * MODULE 13: BR-CAP-01: cảnh báo khi hàng đợi vượt 150% sức chứa thiết kế.
 */
@Entity
@Table(name = "ride_capacities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RideCapacity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;

    /** Khung giờ theo dõi sức chứa */
    @Column(name = "time_slot", nullable = false)
    private LocalTime timeSlot;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "booked_count", nullable = false)
    @Builder.Default
    private Integer bookedCount = 0;

    /**
     * BR-CAP-01: nếu currentWaitingCount > maxCapacity * 1.5 → phát cảnh báo ùn tắc.
     */
    @Column(name = "current_waiting_count", nullable = false)
    @Builder.Default
    private Integer currentWaitingCount = 0;
}
