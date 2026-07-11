package com.smartpark.domain.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing today's hourly visitor count.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitorFlowDto {
    private String hour;
    private Long visitorCount;
}
