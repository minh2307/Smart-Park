package com.smartpark.domain.promotion.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResponseDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String campaignType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
    private String targetCustomers;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
