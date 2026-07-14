package com.smartpark.domain.bi.service;

import com.smartpark.domain.bi.dto.ReportsDto.*;

import java.util.List;

public interface ExportService {
    byte[] exportExcel(ReportGenerateRequest request);
    byte[] exportPdf(ReportGenerateRequest request);
    byte[] exportCsv(ReportGenerateRequest request);
    List<ExportHistoryResponse> getExports();
    ExportHistoryResponse getExportById(Long id);
    List<ExportHistoryResponse> getExportHistory();
    void deleteExport(Long id);
}
