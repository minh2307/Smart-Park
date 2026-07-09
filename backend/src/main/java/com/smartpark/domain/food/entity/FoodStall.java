package com.smartpark.domain.food.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng food_stalls - quầy hàng ẩm thực trong khu ẩm thực.
 * SRS schema: (id, food_court_id, name, code, status)
 * MODULE 24: BR-FC-01: giao dịch F&B phải lưu mã quầy để phân tích DWH.
 */
@Entity
@Table(name = "food_stalls")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodStall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_court_id", nullable = false)
    private FoodCourt foodCourt;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FoodStallStatus status = FoodStallStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum FoodStallStatus { ACTIVE, CLOSED, TEMPORARILY_CLOSED }
}
