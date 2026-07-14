package com.smartpark.domain.membership.dto;

import com.smartpark.domain.membership.entity.PointHistory;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO cho Loyalty (LoyaltyAccount + PointHistory).
 */
public class LoyaltyDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountResponse {
        private Long id;
        private Long customerId;
        private String customerName;
        private Long membershipId;
        private String membershipCode;
        private String tierName;
        private Long currentPoints;
        private Long totalEarned;
        private Long totalRedeemed;
        private Long totalExpired;
        private Long totalAdjusted;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionResponse {
        private Long id;
        private Long membershipId;
        private String membershipCode;
        private Long customerId;
        private String customerName;
        private Long orderId;
        private Long pointsEarned;
        private Long pointsRedeemed;
        private PointHistory.TransactionType transactionType;
        private Long balanceBefore;
        private Long balanceAfter;
        private String referenceType;
        private String reason;
        private String performedBy;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EarnRequest {

        @NotNull(message = "Customer ID không được để trống")
        private Long customerId;

        @NotNull(message = "Order ID không được để trống")
        private Long orderId;

        @NotNull(message = "Số tiền thanh toán không được để trống")
        @DecimalMin(value = "0", message = "Số tiền không âm")
        private java.math.BigDecimal amountPaid;

        @Size(max = 255)
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RedeemRequest {

        @NotNull(message = "Customer ID không được để trống")
        private Long customerId;

        @NotNull(message = "Số điểm đổi không được để trống")
        @Min(value = 1, message = "Số điểm đổi tối thiểu là 1")
        private Long points;

        private Long orderId;

        @Size(max = 255)
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdjustRequest {

        @NotNull(message = "Customer ID không được để trống")
        private Long customerId;

        @NotNull(message = "Số điểm điều chỉnh không được để trống")
        private Long points;

        @NotBlank(message = "Lý do điều chỉnh không được để trống")
        @Size(max = 255)
        private String reason;

        /** Nếu null → lấy username từ Security context */
        private String performedBy;
    }
}
