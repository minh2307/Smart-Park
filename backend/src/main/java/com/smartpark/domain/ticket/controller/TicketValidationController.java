package com.smartpark.domain.ticket.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.ticket.dto.ScanRequestDto;
import com.smartpark.domain.ticket.dto.ScanResponseDto;
import com.smartpark.domain.ticket.dto.ValidationLogDto;
import com.smartpark.domain.ticket.dto.ValidationSummaryStatsDto;
import com.smartpark.domain.ticket.service.TicketValidationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/check-in")
@RequiredArgsConstructor
@Tag(name = "Access Control (Check-in) Management", description = "Endpoints for ticket QR code scanning, validation, and real-time gate history tracking.")
public class TicketValidationController {

    private final TicketValidationService validationService;

    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Validate Ticket Scan", description = "Validates scanned ticket QR code at the gate/ride check-in point.")
    public ResponseEntity<ApiResponse<ScanResponseDto>> validateScan(@Valid @RequestBody ScanRequestDto request) {
        ScanResponseDto response = validationService.validateScan(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Get Validation Scan Logs", description = "Retrieves a paginated list of all ticket validation scans (success and failure).")
    public ResponseEntity<ApiResponse<Page<ValidationLogDto>>> getValidationLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long gateId,
            Pageable pageable) {
        Page<ValidationLogDto> logs = validationService.getValidationLogs(search, status, gateId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Get Validation Stats", description = "Retrieves scanning statistics for dashboard cards.")
    public ResponseEntity<ApiResponse<ValidationSummaryStatsDto>> getValidationStats() {
        ValidationSummaryStatsDto stats = validationService.getValidationStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/clear")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Clear Scan Logs", description = "Admin only. Clears all validation logs from the database.")
    public ResponseEntity<ApiResponse<Void>> clearValidationLogs() {
        validationService.clearValidationLogs();
        return ResponseEntity.ok(ApiResponse.success("Scan history cleared successfully", null));
    }
}
