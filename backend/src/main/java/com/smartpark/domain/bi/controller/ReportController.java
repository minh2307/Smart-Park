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
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PARK_MANAGER', 'FINANCE_MANAGER', 'BUSINESS_ANALYST')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportConfigResponse>>> getReports() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReports()));
    }

    @GetMapping("/{reportType}")
    public ResponseEntity<ApiResponse<ReportConfigResponse>> getReportById(@PathVariable String reportType) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportById(reportType)));
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<ReportHistoryResponse>> generateReport(@RequestBody ReportGenerateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(reportService.generateReport(request)));
    }

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<ReportPreviewResponse>> previewReport(@RequestBody ReportPreviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success(reportService.previewReport(request)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ReportHistoryResponse>>> getReportHistory() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportHistory()));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReportHistory(@PathVariable Long id) {
        reportService.deleteReportHistory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
