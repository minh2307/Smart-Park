package com.smartpark.domain.promotion.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignRequestDto {

    @NotBlank(message = "Mã chiến dịch không được để trống")
    @Size(max = 50, message = "Mã chiến dịch tối đa 50 ký tự")
    private String code;

    @NotBlank(message = "Tên chiến dịch không được để trống")
    @Size(max = 150, message = "Tên chiến dịch tối đa 150 ký tự")
    private String name;

    private String description;

    @NotBlank(message = "Loại chiến dịch không được để trống")
    private String campaignType;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    @Positive(message = "Ngân sách phải là số dương")
    private BigDecimal budget;

    private String targetCustomers;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}
