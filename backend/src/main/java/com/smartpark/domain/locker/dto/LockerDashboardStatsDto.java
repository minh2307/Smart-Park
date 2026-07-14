package com.smartpark.domain.locker.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerDashboardStatsDto {
    private long totalLockers;
    private long availableCount;
    private long occupiedCount;
    private long reservedCount;
    private long outOfServiceCount;
    private BigDecimal revenue;
    private long rentalCount;
    private double usageRate;
}
