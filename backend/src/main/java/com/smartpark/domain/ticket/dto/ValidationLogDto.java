package com.smartpark.domain.ticket.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationLogDto {
    private Long id;
    private Long ticketId;
    private String ticketCode;
    private String customerName;
    private Long attractionId;
    private String attractionName;
    private LocalDateTime checkInTime;
    private String status;
    private Long gateId;
    private String gateCode;
    private String operatorName;
    private String failureReason;
    private Integer remainingUsage;
}
