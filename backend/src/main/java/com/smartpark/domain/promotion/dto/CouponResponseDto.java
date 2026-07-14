package com.smartpark.domain.promotion.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponseDto {
    private Long id;
    private Long promotionId;
    private String promotionName;
    private String code;
    private Integer maxUses;
    private Integer currentUses;
    private Integer remainingQuantity;
    private BigDecimal discountAmount;
    private BigDecimal minOrderValue;
    private LocalDate expirationDate;
    private Long customerId;
    private String customerName;
    private String status;
}
