package com.smartpark.domain.bi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.bi.dto.ReportsDto.*;
import com.smartpark.domain.bi.service.ExportService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.HashMap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExportController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ExportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExportService exportService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testExportExcel() throws Exception {
        ReportGenerateRequest req = ReportGenerateRequest.builder()
                .reportType("REVENUE")
                .exportFormat("EXCEL")
                .filters(new HashMap<>())
                .build();

        byte[] fakeBytes = "ExcelData".getBytes();
        when(exportService.exportExcel(any())).thenReturn(fakeBytes);

        mockMvc.perform(post("/api/v1/exports/excel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(content().bytes(fakeBytes));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testExportPdf() throws Exception {
        ReportGenerateRequest req = ReportGenerateRequest.builder()
                .reportType("REVENUE")
                .exportFormat("PDF")
                .filters(new HashMap<>())
                .build();

        byte[] fakeBytes = "PDFData".getBytes();
        when(exportService.exportPdf(any())).thenReturn(fakeBytes);

        mockMvc.perform(post("/api/v1/exports/pdf")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(fakeBytes));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testExportCsv() throws Exception {
        ReportGenerateRequest req = ReportGenerateRequest.builder()
                .reportType("REVENUE")
                .exportFormat("CSV")
                .filters(new HashMap<>())
                .build();

        byte[] fakeBytes = "CSVData".getBytes();
        when(exportService.exportCsv(any())).thenReturn(fakeBytes);

        mockMvc.perform(post("/api/v1/exports/csv")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(content().bytes(fakeBytes));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetExports() throws Exception {
        ExportHistoryResponse resp = ExportHistoryResponse.builder()
                .id(1L)
                .exportFormat("EXCEL")
                .status("COMPLETED")
                .build();

        when(exportService.getExports()).thenReturn(Collections.singletonList(resp));

        mockMvc.perform(get("/api/v1/exports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1L));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetExportById() throws Exception {
        ExportHistoryResponse resp = ExportHistoryResponse.builder()
                .id(1L)
                .exportFormat("EXCEL")
                .status("COMPLETED")
                .build();

        when(exportService.getExportById(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/v1/exports/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetExportHistory() throws Exception {
        ExportHistoryResponse resp = ExportHistoryResponse.builder()
                .id(1L)
                .exportFormat("EXCEL")
                .status("COMPLETED")
                .build();

        when(exportService.getExportHistory()).thenReturn(Collections.singletonList(resp));

        mockMvc.perform(get("/api/v1/exports/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1L));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testDeleteExport() throws Exception {
        mockMvc.perform(delete("/api/v1/exports/1"))
                .andExpect(status().isOk());
    }
}
