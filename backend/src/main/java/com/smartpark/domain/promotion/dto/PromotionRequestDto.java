package com.smartpark.domain.promotion.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionRequestDto {

    private Long campaignId;

    @NotBlank(message = "Mã khuyến mãi không được để trống")
    @Size(max = 50, message = "Mã khuyến mãi tối đa 50 ký tự")
    private String code;

    @NotBlank(message = "Tên khuyến mãi không được để trống")
    @Size(max = 150, message = "Tên khuyến mãi tối đa 150 ký tự")
    private String name;

    private String description;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    @NotBlank(message = "Loại chiết khấu không được để trống")
    private String discountType; // PERCENTAGE, FIXED_AMOUNT

    @NotNull(message = "Giá trị chiết khấu không được để trống")
    @Positive(message = "Giá trị chiết khấu phải là số dương")
    private BigDecimal value;

    private BigDecimal maxDiscount;

    private BigDecimal minOrder;

    private String applicableTicketTypes;

    private String applicableMembershipTier;

    private String validTime;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}
