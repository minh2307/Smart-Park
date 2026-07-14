package com.smartpark.domain.membership.dto;

import com.smartpark.domain.membership.entity.Membership;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO cho Membership — wrapper class pattern.
 */
public class MembershipDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "Customer ID không được để trống")
        private Long customerId;

        @NotNull(message = "Tier ID không được để trống")
        private Long tierId;

        @NotNull(message = "Ngày bắt đầu không được để trống")
        private LocalDate startDate;

        private LocalDate expirationDate;

        private Boolean autoRenewal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        private Long tierId;

        private LocalDate expirationDate;

        private Boolean autoRenewal;

        private Membership.MembershipStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpgradeRequest {
        @NotNull(message = "Tier ID mới không được để trống")
        private Long newTierId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RenewRequest {
        /** Số tháng gia hạn thêm (mặc định 12 nếu null) */
        @Min(value = 1, message = "Số tháng gia hạn tối thiểu là 1")
        @Max(value = 24, message = "Số tháng gia hạn tối đa là 24")
        private Integer months;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancelRequest {
        @Size(max = 500)
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String membershipCode;
        private Long customerId;
        private String customerName;
        private Long tierId;
        private String tierName;
        private String tierCode;
        private LocalDate joinDate;
        private LocalDate startDate;
        private LocalDate expirationDate;
        private Boolean autoRenewal;
        private Long points;
        private BigDecimal currentSpending;
        private BigDecimal lifetimeSpending;
        private Integer renewalCount;
        private Membership.MembershipStatus status;
        private LocalDateTime cancelledAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
