package com.smartpark.domain.employee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Bảng employee_departments - liên kết nhân viên với phòng ban.
 * SRS schema: (employee_id, department_id, start_date, end_date)
 * BR-EMP-01: nhân viên mới phải được gắn vào một phòng ban đang hoạt động.
 */
@Entity
@Table(name = "employee_departments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /** Null means currently active in this department */
    @Column(name = "end_date")
    private LocalDate endDate;
}
