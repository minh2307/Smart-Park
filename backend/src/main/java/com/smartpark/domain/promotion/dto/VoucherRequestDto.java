package com.smartpark.domain.promotion.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherRequestDto {

    @NotBlank(message = "Mã Voucher không được để trống")
    @Size(max = 50, message = "Mã Voucher tối đa 50 ký tự")
    private String code;

    @NotNull(message = "Giá trị Voucher không được để trống")
    @Positive(message = "Giá trị Voucher phải là số dương")
    private BigDecimal voucherValue;

    @NotNull(message = "Ngày bắt đầu có hiệu lực không được để trống")
    private LocalDate validFrom;

    @NotNull(message = "Ngày hết hạn không được để trống")
    private LocalDate validTo;

    private Long customerId;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}
