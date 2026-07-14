package com.smartpark.domain.promotion.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionValidateRequestDto {

    @NotBlank(message = "Mã chương trình khuyến mãi không được để trống")
    private String code;

    @NotNull(message = "ID khách hàng không được để trống")
    private Long customerId;

    @NotNull(message = "Tổng tiền đơn hàng không được để trống")
    @PositiveOrZero(message = "Tổng tiền đơn hàng phải lớn hơn hoặc bằng 0")
    private BigDecimal orderTotal;

    private List<Long> ticketTypeIds;
}
