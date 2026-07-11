package com.smartpark.domain.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Data Transfer Object representing revenue, cost, and profit over a specified period.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueAnalyticsDto {
    private String period;
    private BigDecimal revenue;
    private BigDecimal cost;
    private BigDecimal profit;
}
