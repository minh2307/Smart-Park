package com.gateos.module.checkin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "check_in")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "gate_staff_id")
    private Long gateStaffId;

    @Column(name = "attraction_id")
    private Long attractionId;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckInStatus status;

    @Column(name = "failure_reason", length = 100)
    private String failureReason;

    public enum CheckInStatus {
        SUCCESS, FAILED
    }
}
