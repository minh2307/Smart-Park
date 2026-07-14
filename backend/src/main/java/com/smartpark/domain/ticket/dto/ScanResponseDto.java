package com.smartpark.domain.ticket.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanResponseDto {
    private Long id;
    private Long ticketId;
    private Long attractionId;
    private LocalDateTime checkInTime;
    private String status;
    private boolean success;
    private ValidationLogDto log;
}
