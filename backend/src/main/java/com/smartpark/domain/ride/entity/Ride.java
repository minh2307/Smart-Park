package com.smartpark.domain.ride.entity;

import com.smartpark.domain.park.entity.Zone;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "rides")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_category_id")
    private RideCategory rideCategory;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer capacity;

    /** Validation: must be > 0 and <= 250 (BR in Module 10) */
    @Column(name = "min_height")
    private Double minHeight;

    @Column(name = "max_height")
    private Double maxHeight;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    /** BR-RIDE-01: can only be OPERATIONAL if inspection passed today */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RideStatus status = RideStatus.SCHEDULED;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum RideStatus {
        SCHEDULED, OPERATIONAL, UNDER_MAINTENANCE, OUT_OF_ORDER, EMERGENCY_STOP
    }
}
