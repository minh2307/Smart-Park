package com.smartpark.domain.ticket.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketTypeResponseDto {
    private Long id;
    private Long venueId;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private String type;
    private String status;
    private LocalDateTime createdAt;
}
