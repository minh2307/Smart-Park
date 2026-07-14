package com.smartpark.domain.bi.service;

import com.smartpark.domain.bi.dto.ReportsDto.*;

import java.util.List;

public interface ReportService {
    List<ReportConfigResponse> getReports();
    ReportConfigResponse getReportById(String reportType);
    ReportHistoryResponse generateReport(ReportGenerateRequest request);
    ReportPreviewResponse previewReport(ReportPreviewRequest request);
    List<ReportHistoryResponse> getReportHistory();
    void deleteReportHistory(Long id);

    List<ReportScheduleResponse> getSchedules();
    ReportScheduleResponse getScheduleById(Long id);
    ReportScheduleResponse createSchedule(ReportScheduleRequest request);
    ReportScheduleResponse updateSchedule(Long id, ReportScheduleRequest request);
    void deleteSchedule(Long id);
    ReportScheduleResponse enableSchedule(Long id);
    ReportScheduleResponse disableSchedule(Long id);
    void runScheduleImmediately(Long id);
}
