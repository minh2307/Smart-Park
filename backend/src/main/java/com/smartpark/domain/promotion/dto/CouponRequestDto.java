package com.smartpark.domain.promotion.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequestDto {

    @NotNull(message = "ID chương trình khuyến mãi không được để trống")
    private Long promotionId;

    @NotBlank(message = "Mã Coupon không được để trống")
    @Size(max = 50, message = "Mã Coupon tối đa 50 ký tự")
    private String code;

    @NotNull(message = "Số lượng giới hạn không được để trống")
    @PositiveOrZero(message = "Số lượng giới hạn phải lớn hơn hoặc bằng 0")
    private Integer maxUses;

    @NotNull(message = "Số tiền giảm giá không được để trống")
    @Positive(message = "Số tiền giảm giá phải là số dương")
    private BigDecimal discountAmount;

    private BigDecimal minOrderValue;

    private LocalDate expirationDate;

    private Long customerId;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}
