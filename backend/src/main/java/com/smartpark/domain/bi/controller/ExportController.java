package com.smartpark.domain.bi.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.bi.dto.ReportsDto.*;
import com.smartpark.domain.bi.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PARK_MANAGER', 'FINANCE_MANAGER', 'BUSINESS_ANALYST')")
public class ExportController {

    private final ExportService exportService;

    @PostMapping("/excel")
    public ResponseEntity<byte[]> exportExcel(@RequestBody ReportGenerateRequest request) {
        byte[] data = exportService.exportExcel(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + request.getReportType().toLowerCase() + "_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @PostMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestBody ReportGenerateRequest request) {
        byte[] data = exportService.exportPdf(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + request.getReportType().toLowerCase() + "_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    @PostMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(@RequestBody ReportGenerateRequest request) {
        byte[] data = exportService.exportCsv(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + request.getReportType().toLowerCase() + "_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExportHistoryResponse>>> getExports() {
        return ResponseEntity.ok(ApiResponse.success(exportService.getExports()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExportHistoryResponse>> getExportById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(exportService.getExportById(id)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ExportHistoryResponse>>> getExportHistory() {
        return ResponseEntity.ok(ApiResponse.success(exportService.getExportHistory()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExport(@PathVariable Long id) {
        exportService.deleteExport(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
