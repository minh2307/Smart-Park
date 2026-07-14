package com.smartpark.domain.promotion.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignStatisticsDto {
    private long totalCampaigns;
    private long activeCampaigns;
    private BigDecimal totalBudget;
    private long totalCouponUsages;
    private BigDecimal totalCouponDiscounts;
}
