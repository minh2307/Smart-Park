package com.smartpark.domain.food.entity;

import com.smartpark.domain.park.entity.Park;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Bảng food_courts - khu ẩm thực trong công viên.
 * SRS schema: (id, park_id, name, code, status)
 * MODULE 24: BR-FC-01: lưu mã quầy hàng phục vụ phân tích Spark DWH.
 */
@Entity
@Table(name = "food_courts")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodCourt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "park_id", nullable = false)
    private Park park;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FoodCourtStatus status = FoodCourtStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum FoodCourtStatus { ACTIVE, CLOSED }
}
