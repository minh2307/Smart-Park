package com.smartpark.domain.bi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.bi.dto.ReportsDto.*;
import com.smartpark.domain.bi.service.ReportService;
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

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

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
    void testGetReports() throws Exception {
        ReportConfigResponse cfg = ReportConfigResponse.builder()
                .reportType("REVENUE")
                .name("Revenue Report")
                .description("Desc")
                .supportedFormats(Collections.singletonList("EXCEL"))
                .supportedFilters(Collections.singletonList("dateRange"))
                .build();

        when(reportService.getReports()).thenReturn(Collections.singletonList(cfg));

        mockMvc.perform(get("/api/v1/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].reportType").value("REVENUE"))
                .andExpect(jsonPath("$.data[0].name").value("Revenue Report"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetReportById() throws Exception {
        ReportConfigResponse cfg = ReportConfigResponse.builder()
                .reportType("REVENUE")
                .name("Revenue Report")
                .description("Desc")
                .build();

        when(reportService.getReportById("REVENUE")).thenReturn(cfg);

        mockMvc.perform(get("/api/v1/reports/REVENUE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reportType").value("REVENUE"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGenerateReport() throws Exception {
        ReportGenerateRequest req = ReportGenerateRequest.builder()
                .reportType("REVENUE")
                .exportFormat("EXCEL")
                .filters(new HashMap<>())
                .build();

        ReportHistoryResponse resp = ReportHistoryResponse.builder()
                .id(1L)
                .reportType("REVENUE")
                .generatedAt(LocalDateTime.now())
                .status("PENDING")
                .build();

        when(reportService.generateReport(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/reports/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1L))
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testPreviewReport() throws Exception {
        ReportPreviewRequest req = ReportPreviewRequest.builder()
                .reportType("REVENUE")
                .filters(new HashMap<>())
                .build();

        ReportPreviewResponse resp = ReportPreviewResponse.builder()
                .headers(Collections.singletonList("Period"))
                .data(Collections.singletonList(new HashMap<>()))
                .build();

        when(reportService.previewReport(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/reports/preview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.headers[0]").value("Period"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetReportHistory() throws Exception {
        ReportHistoryResponse hist = ReportHistoryResponse.builder()
                .id(1L)
                .reportType("REVENUE")
                .status("COMPLETED")
                .build();

        when(reportService.getReportHistory()).thenReturn(Collections.singletonList(hist));

        mockMvc.perform(get("/api/v1/reports/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1L));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testDeleteReportHistory() throws Exception {
        mockMvc.perform(delete("/api/v1/reports/history/1"))
                .andExpect(status().isOk());
    }
}
