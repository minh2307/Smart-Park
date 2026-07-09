package com.smartpark.domain.maintenance.entity;

import com.smartpark.domain.ride.entity.Ride;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ride_inspections")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RideInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;

    /** ID of the inspector (references employees table) */
    @Column(name = "inspector_id", nullable = false)
    private Long inspectorId;

    /** BR-INSP-01: must be submitted before 07:30 every morning */
    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InspectionResult status;

    @Column(name = "result_details", columnDefinition = "TEXT")
    private String resultDetails;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum InspectionResult { PASS, FAIL }
}
