package com.smartpark.domain.feedback.entity;

import com.smartpark.domain.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng feedbacks - ý kiến phản hồi và đánh giá dịch vụ của khách hàng.
 * SRS schema: (id, customer_id, category, content, rating, assigned_employee_id, status, created_at)
 * MODULE 28: Tiếp nhận đánh giá chất lượng dịch vụ, giải quyết khiếu nại.
 */
@Entity
@Table(name = "feedbacks")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackCategory category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /** Đánh giá từ 1-5 sao */
    @Column(nullable = false)
    private Integer rating;

    /** ID nhân viên CSKH được phân công xử lý phản hồi này */
    @Column(name = "assigned_employee_id")
    private Long assignedEmployeeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FeedbackStatus status = FeedbackStatus.OPEN;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum FeedbackCategory { RIDE, FOOD, STAFF, FACILITY, SAFETY, OTHER }
    public enum FeedbackStatus { OPEN, IN_REVIEW, RESOLVED, CLOSED }
}
