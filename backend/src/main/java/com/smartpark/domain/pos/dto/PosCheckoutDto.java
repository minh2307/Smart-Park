package com.smartpark.domain.pos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class PosCheckoutDto {
    private PosCheckoutDto() {}

    public enum ItemType { RETAIL, FOOD, TICKET }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemRequest {
        @NotNull private ItemType itemType;
        @NotNull @Positive private Long referenceId;
        @Size(max = 50) private String sku;
        @NotNull @Min(1) @Max(100) private Integer quantity;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CheckoutRequest {
        @NotBlank @Size(max = 50) private String terminalId;
        @NotNull @Positive private Long parkId;
        @NotNull @Positive private Long customerId;
        @NotBlank @Size(max = 30) private String paymentMethodCode;
        @Size(max = 50) private String couponCode;
        @NotEmpty @Size(max = 100) private List<@Valid ItemRequest> items;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CheckoutResponse {
        private Long orderId;
        private String orderCode;
        private Long paymentId;
        private String paymentStatus;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private String receiptNumber;
        private LocalDateTime createdAt;
    }
}
