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

import java.util.Collections;
import java.util.HashMap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReportScheduleController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ReportScheduleControllerTest {

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
    void testGetSchedules() throws Exception {
        ReportScheduleResponse resp = ReportScheduleResponse.builder()
                .id(1L)
                .reportType("REVENUE")
                .cronExpression("0 0 0 * * ?")
                .exportFormat("EXCEL")
                .enabled(true)
                .build();

        when(reportService.getSchedules()).thenReturn(Collections.singletonList(resp));

        mockMvc.perform(get("/api/v1/report-schedules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1L))
                .andExpect(jsonPath("$.data[0].cronExpression").value("0 0 0 * * ?"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetScheduleById() throws Exception {
        ReportScheduleResponse resp = ReportScheduleResponse.builder()
                .id(1L)
                .reportType("REVENUE")
                .enabled(true)
                .build();

        when(reportService.getScheduleById(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/v1/report-schedules/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testCreateSchedule() throws Exception {
        ReportScheduleRequest req = ReportScheduleRequest.builder()
                .reportType("REVENUE")
                .cronExpression("0 0 0 * * ?")
                .exportFormat("EXCEL")
                .emailRecipients("admin@smartpark.com")
                .enabled(true)
                .filters(new HashMap<>())
                .build();

        ReportScheduleResponse resp = ReportScheduleResponse.builder()
                .id(1L)
                .reportType("REVENUE")
                .enabled(true)
                .build();

        when(reportService.createSchedule(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/report-schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testUpdateSchedule() throws Exception {
        ReportScheduleRequest req = ReportScheduleRequest.builder()
                .reportType("REVENUE")
                .cronExpression("0 0 0 * * ?")
                .exportFormat("EXCEL")
                .enabled(true)
                .build();

        ReportScheduleResponse resp = ReportScheduleResponse.builder()
                .id(1L)
                .reportType("REVENUE")
                .enabled(true)
                .build();

        when(reportService.updateSchedule(eq(1L), any())).thenReturn(resp);

        mockMvc.perform(put("/api/v1/report-schedules/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testDeleteSchedule() throws Exception {
        mockMvc.perform(delete("/api/v1/report-schedules/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testEnableSchedule() throws Exception {
        ReportScheduleResponse resp = ReportScheduleResponse.builder()
                .id(1L)
                .enabled(true)
                .build();

        when(reportService.enableSchedule(1L)).thenReturn(resp);

        mockMvc.perform(patch("/api/v1/report-schedules/1/enable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled").value(true));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testDisableSchedule() throws Exception {
        ReportScheduleResponse resp = ReportScheduleResponse.builder()
                .id(1L)
                .enabled(false)
                .build();

        when(reportService.disableSchedule(1L)).thenReturn(resp);

        mockMvc.perform(patch("/api/v1/report-schedules/1/disable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled").value(false));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testRunScheduleImmediately() throws Exception {
        mockMvc.perform(patch("/api/v1/report-schedules/1/run"))
                .andExpect(status().isOk());
    }
}
