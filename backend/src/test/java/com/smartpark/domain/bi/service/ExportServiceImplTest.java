package com.smartpark.domain.bi.service;

import com.smartpark.domain.bi.dto.ReportsDto.*;
import com.smartpark.domain.bi.entity.ExportHistory;
import com.smartpark.domain.bi.repository.ExportHistoryRepository;
import com.smartpark.domain.bi.service.impl.ExportServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExportServiceImplTest {

    @Mock
    private ExportHistoryRepository exportHistoryRepository;

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ExportServiceImpl exportService;

    @Test
    void testExportExcel() {
        ReportPreviewResponse preview = ReportPreviewResponse.builder()
                .headers(Arrays.asList("Col1", "Col2"))
                .data(Collections.singletonList(new HashMap<String, Object>() {{
                    put("Col1", "Val1");
                    put("Col2", 123.45);
                }}))
                .build();

        when(reportService.previewReport(any())).thenReturn(preview);
        when(exportHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReportGenerateRequest req = ReportGenerateRequest.builder()
                .reportType("REVENUE")
                .exportFormat("EXCEL")
                .filters(new HashMap<>())
                .build();

        byte[] result = exportService.exportExcel(req);
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void testExportPdf() {
        ReportPreviewResponse preview = ReportPreviewResponse.builder()
                .headers(Arrays.asList("Col1", "Col2"))
                .data(Collections.singletonList(new HashMap<String, Object>() {{
                    put("Col1", "Val1");
                    put("Col2", "Val2");
                }}))
                .build();

        when(reportService.previewReport(any())).thenReturn(preview);
        when(exportHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReportGenerateRequest req = ReportGenerateRequest.builder()
                .reportType("REVENUE")
                .exportFormat("PDF")
                .filters(new HashMap<>())
                .build();

        byte[] result = exportService.exportPdf(req);
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void testExportCsv() {
        ReportPreviewResponse preview = ReportPreviewResponse.builder()
                .headers(Arrays.asList("Col1", "Col2"))
                .data(Collections.singletonList(new HashMap<String, Object>() {{
                    put("Col1", "Val,1");
                    put("Col2", "Val\"2");
                }}))
                .build();

        when(reportService.previewReport(any())).thenReturn(preview);
        when(exportHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReportGenerateRequest req = ReportGenerateRequest.builder()
                .reportType("REVENUE")
                .exportFormat("CSV")
                .filters(new HashMap<>())
                .build();

        byte[] result = exportService.exportCsv(req);
        assertNotNull(result);
        String csv = new String(result);
        assertTrue(csv.contains("Col1,Col2"));
        assertTrue(csv.contains("\"Val,1\""));
    }

    @Test
    void testGetExports() {
        ExportHistory h = ExportHistory.builder().id(1L).exportFormat("EXCEL").status(ExportHistory.ExportStatus.COMPLETED).build();
        when(exportHistoryRepository.findAll()).thenReturn(Collections.singletonList(h));

        List<ExportHistoryResponse> list = exportService.getExports();
        assertEquals(1, list.size());
    }

    @Test
    void testGetExportById() {
        ExportHistory h = ExportHistory.builder().id(1L).exportFormat("EXCEL").status(ExportHistory.ExportStatus.COMPLETED).build();
        when(exportHistoryRepository.findById(1L)).thenReturn(Optional.of(h));

        ExportHistoryResponse resp = exportService.getExportById(1L);
        assertNotNull(resp);
        assertEquals(1L, resp.getId());
    }

    @Test
    void testGetExportHistory() {
        ExportHistory h = ExportHistory.builder().id(1L).exportFormat("EXCEL").status(ExportHistory.ExportStatus.COMPLETED).build();
        when(exportHistoryRepository.findAll()).thenReturn(Collections.singletonList(h));

        List<ExportHistoryResponse> list = exportService.getExportHistory();
        assertEquals(1, list.size());
    }

    @Test
    void testDeleteExport() {
        exportService.deleteExport(1L);
        verify(exportHistoryRepository).deleteById(1L);
    }
}
