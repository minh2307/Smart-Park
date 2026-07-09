package com.smartpark.domain.food.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bảng food_items - danh mục món ăn của từng quầy ẩm thực.
 * SRS schema: (id, food_stall_id, name, price, status)
 * MODULE 24: Thực đơn số, gọi món qua POS di động.
 */
@Entity
@Table(name = "food_items")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_stall_id", nullable = false)
    private FoodStall foodStall;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FoodItemStatus status = FoodItemStatus.AVAILABLE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum FoodItemStatus { AVAILABLE, UNAVAILABLE, SEASONAL }
}
