package com.smartpark.domain.bi.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.smartpark.domain.bi.dto.ReportsDto.*;
import com.smartpark.domain.bi.entity.ExportHistory;
import com.smartpark.domain.bi.repository.ExportHistoryRepository;
import com.smartpark.domain.bi.service.ExportService;
import com.smartpark.domain.bi.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExportServiceImpl implements ExportService {

    private final ExportHistoryRepository exportHistoryRepository;
    
    @Lazy
    private final ReportService reportService;

    @Override
    public byte[] exportExcel(ReportGenerateRequest request) {
        ReportPreviewRequest previewRequest = ReportPreviewRequest.builder()
                .reportType(request.getReportType())
                .filters(request.getFilters())
                .build();
        ReportPreviewResponse preview = reportService.previewReport(previewRequest);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(request.getReportType() + " Report");
            
            // Header row
            Row headerRow = sheet.createRow(0);
            List<String> headers = preview.getHeaders();
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
            }

            // Data rows
            List<Map<String, Object>> data = preview.getData();
            for (int r = 0; r < data.size(); r++) {
                Row row = sheet.createRow(r + 1);
                Map<String, Object> dataRow = data.get(r);
                for (int c = 0; c < headers.size(); c++) {
                    Cell cell = row.createCell(c);
                    Object val = dataRow.get(headers.get(c));
                    if (val != null) {
                        if (val instanceof Number) {
                            cell.setCellValue(((Number) val).doubleValue());
                        } else {
                            cell.setCellValue(val.toString());
                        }
                    } else {
                        cell.setCellValue("");
                    }
                }
            }

            workbook.write(bos);
            saveExportHistory(request.getReportType(), "EXCEL");
            return bos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Excel export failed: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] exportPdf(ReportGenerateRequest request) {
        ReportPreviewRequest previewRequest = ReportPreviewRequest.builder()
                .reportType(request.getReportType())
                .filters(request.getFilters())
                .build();
        ReportPreviewResponse preview = reportService.previewReport(previewRequest);

        try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, bos);
            document.open();
            
            document.add(new Paragraph(request.getReportType() + " Report"));
            document.add(new Paragraph("Generated at: " + LocalDateTime.now()));
            document.add(new Paragraph("\n"));

            List<String> headers = preview.getHeaders();
            PdfPTable table = new PdfPTable(headers.size());
            table.setWidthPercentage(100);

            for (String header : headers) {
                table.addCell(header);
            }

            for (Map<String, Object> dataRow : preview.getData()) {
                for (String header : headers) {
                    Object val = dataRow.get(header);
                    table.addCell(val != null ? val.toString() : "");
                }
            }

            document.add(table);
            document.close();
            
            saveExportHistory(request.getReportType(), "PDF");
            return bos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF export failed: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] exportCsv(ReportGenerateRequest request) {
        ReportPreviewRequest previewRequest = ReportPreviewRequest.builder()
                .reportType(request.getReportType())
                .filters(request.getFilters())
                .build();
        ReportPreviewResponse preview = reportService.previewReport(previewRequest);

        StringBuilder sb = new StringBuilder();
        List<String> headers = preview.getHeaders();
        
        // Write headers
        sb.append(String.join(",", headers)).append("\n");

        // Write rows
        for (Map<String, Object> dataRow : preview.getData()) {
            String rowStr = headers.stream().map(h -> {
                Object val = dataRow.get(h);
                if (val == null) return "";
                String str = val.toString().replace("\"", "\"\"");
                if (str.contains(",") || str.contains("\n") || str.contains("\"")) {
                    return "\"" + str + "\"";
                }
                return str;
            }).collect(Collectors.joining(","));
            sb.append(rowStr).append("\n");
        }

        saveExportHistory(request.getReportType(), "CSV");
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void saveExportHistory(String reportType, String format) {
        ExportHistory history = ExportHistory.builder()
                .exportFormat(format)
                .status(ExportHistory.ExportStatus.COMPLETED)
                .downloadUrl("/api/v1/exports/download/" + reportType.toLowerCase() + "_" + System.currentTimeMillis())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        exportHistoryRepository.save(history);
    }

    @Override
    public List<ExportHistoryResponse> getExports() {
        return exportHistoryRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ExportHistoryResponse getExportById(Long id) {
        ExportHistory eh = exportHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Export not found: " + id));
        return toResponse(eh);
    }

    @Override
    public List<ExportHistoryResponse> getExportHistory() {
        return getExports();
    }

    @Override
    @Transactional
    public void deleteExport(Long id) {
        exportHistoryRepository.deleteById(id);
    }

    private ExportHistoryResponse toResponse(ExportHistory eh) {
        return ExportHistoryResponse.builder()
                .id(eh.getId())
                .reportHistoryId(eh.getReportHistory() != null ? eh.getReportHistory().getId() : null)
                .exportFormat(eh.getExportFormat())
                .exportedAt(eh.getExportedAt())
                .exportedBy(eh.getExportedBy())
                .status(eh.getStatus().name())
                .downloadUrl(eh.getDownloadUrl())
                .expiresAt(eh.getExpiresAt())
                .build();
    }
}
