package com.smartpark.domain.ticket.controller;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.ticket.dto.ScanRequestDto;
import com.smartpark.domain.ticket.dto.ScanResponseDto;
import com.smartpark.domain.ticket.dto.ValidationLogDto;
import com.smartpark.domain.ticket.entity.TicketValidationLog;
import com.smartpark.domain.ticket.mapper.TicketValidationMapper;
import com.smartpark.domain.ticket.repository.TicketValidationLogRepository;
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

/**
 * TicketValidationAliasController — Alias của /api/v1/check-in/*
 * tại endpoint chuẩn /api/v1/ticket-validations/*.
 * Tái sử dụng hoàn toàn TicketValidationService.
 * Thêm endpoint mới: GET /{id}, POST /manual.
 */
@RestController
@RequestMapping("/api/v1/ticket-validations")
@RequiredArgsConstructor
@Tag(name = "Ticket Validation (Standard)", description = "Endpoints chuẩn cho xác thực vé — QR scan, manual, lịch sử")
public class TicketValidationAliasController {

    private final TicketValidationService validationService;
    private final TicketValidationLogRepository validationLogRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lấy lịch sử xác thực vé",
               description = "Paginated. Filter: search (ticket code / tên KH), status, gateId.")
    public ResponseEntity<ApiResponse<Page<ValidationLogDto>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long gateId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                validationService.getValidationLogs(search, status, gateId, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Chi tiết bản ghi xác thực theo ID")
    public ResponseEntity<ApiResponse<ValidationLogDto>> getById(@PathVariable Long id) {
        TicketValidationLog log = validationLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketValidation", id));
        return ResponseEntity.ok(ApiResponse.success(TicketValidationMapper.toLogDto(log)));
    }

    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Quét mã QR vé", description = "Xác thực vé QR tại cổng. Ghi log kết quả.")
    public ResponseEntity<ApiResponse<ScanResponseDto>> scan(
            @Valid @RequestBody ScanRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(validationService.validateScan(request)));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Xác thực thủ công",
               description = "Nhập mã vé thủ công (không qua QR scanner). Sử dụng cùng logic validateScan.")
    public ResponseEntity<ApiResponse<ScanResponseDto>> manualValidate(
            @Valid @RequestBody ScanRequestDto request) {
        // Manual validation sử dụng cùng logic scan:
        // gateId, attractionId vẫn là optional trong ScanRequestDto.
        ScanResponseDto response = validationService.validateScan(request);
        return ResponseEntity.ok(ApiResponse.success(
                response.isSuccess()
                        ? "Vé hợp lệ — xác thực thủ công thành công."
                        : "Xác thực thủ công thất bại: " + response.getStatus(),
                response));
    }
}
