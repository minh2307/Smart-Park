package com.smartpark.domain.ride.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Bảng ride_schedules - lịch trình vận hành trò chơi theo ca.
 * SRS schema: (id, ride_id, employee_id, shift_date, start_time, end_time, status)
 * MODULE 12: BR-SCHED-01: nhân viên vận hành phải có chứng chỉ kỹ thuật tương thích.
 */
@Entity
@Table(name = "ride_schedules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RideSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;

    /** ID of the assigned employee (references employees table) */
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "shift_date", nullable = false)
    private LocalDate shiftDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ScheduleStatus status = ScheduleStatus.SCHEDULED;

    public enum ScheduleStatus { SCHEDULED, ACTIVE, COMPLETED, CANCELLED }
}
