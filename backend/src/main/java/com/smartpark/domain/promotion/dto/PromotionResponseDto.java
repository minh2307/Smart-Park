package com.smartpark.domain.promotion.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponseDto {
    private Long id;
    private Long campaignId;
    private String campaignCode;
    private String code;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String discountType;
    private BigDecimal value;
    private BigDecimal maxDiscount;
    private BigDecimal minOrder;
    private String applicableTicketTypes;
    private String applicableMembershipTier;
    private String validTime;
    private String status;
    private LocalDateTime createdAt;
}
