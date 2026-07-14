package com.smartpark.domain.order.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Bảng payment_methods - danh mục phương thức thanh toán.
 * SRS schema: (id, name, code, provider, status)
 * MODULE 20: Tích hợp PayOS, MoMo.
 */
@Entity
@Table(name = "payment_methods")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false, length = 30)
    private String code;

    /** Tên nhà cung cấp, ví dụ: PAYOS, MOMO, BANK_TRANSFER */
    @Column(length = 100)
    private String provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentMethodStatus status = PaymentMethodStatus.ACTIVE;

    public enum PaymentMethodStatus { ACTIVE, INACTIVE }
}
