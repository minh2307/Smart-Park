package com.smartpark.domain.promotion.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherRedeemRequestDto {

    @NotBlank(message = "Mã Voucher không được để trống")
    private String code;

    @NotNull(message = "ID khách hàng không được để trống")
    private Long customerId;

    private Long bookingId;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @Positive(message = "Số tiền thanh toán phải là số dương")
    private BigDecimal redeemAmount;
}
