package com.smartpark.domain.incident.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.incident.dto.IncidentDto;
import com.smartpark.domain.incident.entity.Incident.IncidentSeverity;
import com.smartpark.domain.incident.entity.Incident.IncidentStatus;
import com.smartpark.domain.incident.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Safety Incidents", description = "API báo cáo và xử lý sự cố an ninh, an toàn tại khu vui chơi")
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'SAFETY_MANAGER', 'PARK_MANAGER')")
    @Operation(summary = "Lấy danh sách sự cố với bộ lọc nâng cao")
    public ResponseEntity<ApiResponse<Page<IncidentDto.Response>>> findAllIncidents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) IncidentSeverity severity,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable
    ) {
        Page<IncidentDto.Response> result = incidentService.findAllIncidents(
                search, status, severity, zoneId, startDate, endDate, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'SAFETY_MANAGER', 'PARK_MANAGER')")
    @Operation(summary = "Lấy chi tiết sự cố và lịch sử điều tra")
    public ResponseEntity<ApiResponse<IncidentDto.Response>> findIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.findIncidentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'SAFETY_MANAGER', 'PARK_MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Nhân viên báo cáo sự cố mới")
    public ResponseEntity<ApiResponse<IncidentDto.Response>> createIncident(
            @Valid @RequestBody IncidentDto.CreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.createIncident(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'SAFETY_MANAGER', 'PARK_MANAGER')")
    @Operation(summary = "Cập nhật mô tả, khu vực, mức độ hoặc chi tiết giải quyết sự cố")
    public ResponseEntity<ApiResponse<IncidentDto.Response>> updateIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.updateIncident(id, request)));
    }

    @PatchMapping("/{id}/investigate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'SAFETY_MANAGER')")
    @Operation(summary = "Bắt đầu tiến hành điều tra sự cố")
    public ResponseEntity<ApiResponse<IncidentDto.Response>> investigateIncident(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.startInvestigation(id)));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'SAFETY_MANAGER', 'PARK_MANAGER')")
    @Operation(summary = "Hoàn thành giải quyết/khắc phục sự cố")
    public ResponseEntity<ApiResponse<IncidentDto.Response>> resolveIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentDto.ResolveRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.resolveIncident(id, request)));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'SAFETY_MANAGER', 'PARK_MANAGER')")
    @Operation(summary = "Lấy báo cáo thống kê tình hình sự cố cho dashboard")
    public ResponseEntity<ApiResponse<IncidentDto.StatsResponse>> getIncidentStatistics() {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getIncidentStatistics()));
    }
}
