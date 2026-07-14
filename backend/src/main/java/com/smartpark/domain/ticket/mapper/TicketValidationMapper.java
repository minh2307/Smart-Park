package com.smartpark.domain.ticket.mapper;

import com.smartpark.domain.ticket.dto.ScanResponseDto;
import com.smartpark.domain.ticket.dto.ValidationLogDto;
import com.smartpark.domain.ticket.entity.TicketValidationLog;

public class TicketValidationMapper {

    public static ValidationLogDto toLogDto(TicketValidationLog entity) {
        if (entity == null) {
            return null;
        }

        return ValidationLogDto.builder()
                .id(entity.getId())
                .ticketId(entity.getTicket() != null ? entity.getTicket().getId() : null)
                .ticketCode(entity.getTicketCode())
                .customerName(entity.getCustomerName())
                .attractionId(entity.getAttraction() != null ? entity.getAttraction().getId() : null)
                .attractionName(entity.getAttractionName())
                .checkInTime(entity.getCheckInTime())
                .status(entity.getStatus())
                .gateId(entity.getGateId())
                .gateCode(entity.getGateCode())
                .operatorName(entity.getOperatorName())
                .failureReason(entity.getFailureReason())
                .remainingUsage(entity.getRemainingUsage())
                .build();
    }

    public static ScanResponseDto toScanResponseDto(TicketValidationLog entity) {
        if (entity == null) {
            return null;
        }

        boolean success = "SUCCESS".equalsIgnoreCase(entity.getStatus());

        return ScanResponseDto.builder()
                .id(entity.getId())
                .ticketId(entity.getTicket() != null ? entity.getTicket().getId() : null)
                .attractionId(entity.getAttraction() != null ? entity.getAttraction().getId() : null)
                .checkInTime(entity.getCheckInTime())
                .status(entity.getStatus())
                .success(success)
                .log(toLogDto(entity))
                .build();
    }
}
