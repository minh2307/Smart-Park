package com.smartpark.domain.order.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * OrderDto - Response DTOs for the Order domain.
 * <p>
 * Design: Nested static classes under one DTO file (DRY) to avoid entity exposure.
 * Eliminates LazyInitializationException by mapping at service layer while session is open.
 */
public class OrderDto {

    @Data
    public static class CustomerInfo {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
    }

    @Data
    public static class OrderItemResponse {
        private Long id;
        private String itemType;
        private Long referenceId;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data
    public static class PaymentMethodInfo {
        private Long id;
        private String name;
        private String code;
        private String provider;
        private String status;
    }

    @Data
    public static class PaymentResponse {
        private Long id;
        private Long orderId;
        private PaymentMethodInfo paymentMethod;
        private String transactionReference;
        private BigDecimal amount;
        private String status;
        private LocalDateTime paymentTime;
    }

    @Data
    public static class RefundResponse {
        private Long id;
        private Long paymentId;
        private BigDecimal amount;
        private String reason;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class OrderResponse {
        private Long id;
        private Long bookingId;
        private CustomerInfo customer;
        private String orderCode;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private String status;
        private List<OrderItemResponse> items;
        private List<PaymentResponse> payments;
        private List<RefundResponse> refunds;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class OrderPageResponse {
        private List<OrderResponse> content;
        private long totalElements;
        private int totalPages;
        private int size;
        private int number;
    }
}
