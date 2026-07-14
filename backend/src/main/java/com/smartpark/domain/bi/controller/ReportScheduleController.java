package com.smartpark.domain.bi.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.bi.dto.ReportsDto.*;
import com.smartpark.domain.bi.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/report-schedules")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PARK_MANAGER', 'FINANCE_MANAGER', 'BUSINESS_ANALYST')")
public class ReportScheduleController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportScheduleResponse>>> getSchedules() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getSchedules()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportScheduleResponse>> getScheduleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getScheduleById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReportScheduleResponse>> createSchedule(@RequestBody ReportScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(reportService.createSchedule(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportScheduleResponse>> updateSchedule(@PathVariable Long id, @RequestBody ReportScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(reportService.updateSchedule(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        reportService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{id}/enable")
    public ResponseEntity<ApiResponse<ReportScheduleResponse>> enableSchedule(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(reportService.enableSchedule(id)));
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<ApiResponse<ReportScheduleResponse>> disableSchedule(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(reportService.disableSchedule(id)));
    }

    @PatchMapping("/{id}/run")
    public ResponseEntity<ApiResponse<Void>> runScheduleImmediately(@PathVariable Long id) {
        reportService.runScheduleImmediately(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
