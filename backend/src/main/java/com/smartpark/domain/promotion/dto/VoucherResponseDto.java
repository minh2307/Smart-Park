package com.smartpark.domain.promotion.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponseDto {
    private Long id;
    private String code;
    private BigDecimal voucherValue;
    private BigDecimal remainingBalance;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Long customerId;
    private String customerName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
