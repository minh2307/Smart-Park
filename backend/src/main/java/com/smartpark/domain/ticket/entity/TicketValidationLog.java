package com.smartpark.domain.ticket.entity;

import com.smartpark.domain.ride.entity.Ride;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_validation_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketValidationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    @Column(name = "ticket_code", nullable = false, length = 100)
    private String ticketCode;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attraction_id")
    private Ride attraction;

    @Column(name = "attraction_name", length = 150)
    private String attractionName;

    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "gate_id")
    private Long gateId;

    @Column(name = "gate_code", length = 50)
    private String gateCode;

    @Column(name = "operator_name", length = 100)
    private String operatorName;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @Column(name = "remaining_usage")
    private Integer remainingUsage;
}
