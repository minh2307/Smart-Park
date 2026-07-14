package com.smartpark.domain.ticket.service;

import com.smartpark.domain.ticket.dto.ScanRequestDto;
import com.smartpark.domain.ticket.dto.ScanResponseDto;
import com.smartpark.domain.ticket.dto.ValidationLogDto;
import com.smartpark.domain.ticket.dto.ValidationSummaryStatsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TicketValidationService {
    ScanResponseDto validateScan(ScanRequestDto request);
    Page<ValidationLogDto> getValidationLogs(String search, String status, Long gateId, Pageable pageable);
    ValidationSummaryStatsDto getValidationStats();
    void clearValidationLogs();
}
