package com.smartpark.domain.retail.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bảng retail_items - sản phẩm lưu niệm trong cửa hàng.
 * SRS schema: (id, retail_shop_id, name, sku, price, stock_quantity, status)
 * MODULE 25: Quản lý mã vạch SKU và tồn kho, quét mã thanh toán tại quầy thu ngân.
 */
@Entity
@Table(name = "retail_items")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RetailItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retail_shop_id", nullable = false)
    private RetailShop retailShop;

    @Column(nullable = false, length = 200)
    private String name;

    /** Mã vạch SKU duy nhất của sản phẩm */
    @Column(unique = true, nullable = false, length = 50)
    private String sku;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(name = "low_stock_threshold", nullable = false)
    @Builder.Default
    private Integer lowStockThreshold = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RetailItemStatus status = RetailItemStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    @Column(nullable = false)
    private Long version;

    public enum RetailItemStatus { ACTIVE, OUT_OF_STOCK, DISCONTINUED }
}
