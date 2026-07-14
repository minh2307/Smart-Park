package com.smartpark.domain.membership.dto;

import com.smartpark.domain.membership.entity.MembershipTier;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho MembershipTier — wrapper class pattern.
 */
public class MembershipTierDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "Mã tier không được để trống")
        @Size(max = 20, message = "Mã tier không quá 20 ký tự")
        @Pattern(regexp = "^[A-Z0-9_]+$", message = "Mã tier chỉ gồm chữ hoa, số, gạch dưới")
        private String code;

        @NotBlank(message = "Tên tier không được để trống")
        @Size(max = 50, message = "Tên tier không quá 50 ký tự")
        private String name;

        private String description;

        @DecimalMin(value = "0", message = "Mức chi tiêu tối thiểu không âm")
        private BigDecimal minSpend;

        @DecimalMin(value = "0", message = "Tỷ lệ giảm giá không âm")
        @DecimalMax(value = "100", message = "Tỷ lệ giảm giá không quá 100%")
        private BigDecimal discountPercentage;

        @DecimalMin(value = "1.0", message = "Hệ số nhân điểm tối thiểu là 1.0")
        private BigDecimal pointsMultiplier;

        private Boolean priorityQueue;
        private Boolean freeParking;
        private String birthdayBenefit;
        private Boolean loungeAccess;

        @Min(value = 0, message = "Thứ tự phải >= 0")
        private Integer sortOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @Size(max = 50)
        private String name;

        private String description;

        @DecimalMin(value = "0")
        private BigDecimal minSpend;

        @DecimalMin(value = "0")
        @DecimalMax(value = "100")
        private BigDecimal discountPercentage;

        @DecimalMin(value = "1.0")
        private BigDecimal pointsMultiplier;

        private Boolean priorityQueue;
        private Boolean freeParking;
        private String birthdayBenefit;
        private Boolean loungeAccess;
        private Integer sortOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusRequest {
        @NotNull(message = "Trạng thái không được để trống")
        private MembershipTier.TierStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String code;
        private String name;
        private String description;
        private BigDecimal minSpend;
        private BigDecimal discountPercentage;
        private BigDecimal pointsMultiplier;
        private Boolean priorityQueue;
        private Boolean freeParking;
        private String birthdayBenefit;
        private Boolean loungeAccess;
        private Integer sortOrder;
        private MembershipTier.TierStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
