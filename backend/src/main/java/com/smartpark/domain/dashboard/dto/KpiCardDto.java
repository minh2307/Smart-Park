package com.smartpark.domain.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object representing a single KPI card on the executive dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiCardDto {
    private Object value;
    private Object previousValue;
    private Double growthPercentage;
    private String trend; // "UP", "DOWN", "FLAT"
    private List<Double> sparklineData;
}
