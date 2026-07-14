package com.smartpark.domain.ticket.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationSummaryStatsDto {
    private long totalScans;
    private long successfulScans;
    private long failedScans;
    private long wrongLocationScans;
    private long expiredScans;
    private long alreadyUsedScans;
}
