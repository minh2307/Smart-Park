package com.smartpark.domain.ticket.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.ticket.dto.ScanRequestDto;
import com.smartpark.domain.ticket.dto.ScanResponseDto;
import com.smartpark.domain.ticket.dto.ValidationLogDto;
import com.smartpark.domain.ticket.dto.ValidationSummaryStatsDto;
import com.smartpark.domain.ticket.service.TicketValidationService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TicketValidationController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class TicketValidationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketValidationService validationService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    private ScanRequestDto mockRequest;
    private ScanResponseDto mockResponse;
    private ValidationLogDto mockLog;

    @BeforeEach
    void setup() {
        mockRequest = ScanRequestDto.builder()
                .qrCode("TK_DS_12345")
                .gateId(1L)
                .build();

        mockLog = ValidationLogDto.builder()
                .id(1L)
                .ticketCode("TK_DS_12345")
                .customerName("John Doe")
                .status("SUCCESS")
                .checkInTime(LocalDateTime.now())
                .build();

        mockResponse = ScanResponseDto.builder()
                .id(1L)
                .ticketId(1L)
                .checkInTime(LocalDateTime.now())
                .status("SUCCESS")
                .success(true)
                .log(mockLog)
                .build();
    }

    @Test
    void testValidateScan() throws Exception {
        when(validationService.validateScan(any(ScanRequestDto.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/check-in/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.success").value(true));
    }

    @Test
    void testGetValidationLogs() throws Exception {
        PageImpl<ValidationLogDto> page = new PageImpl<>(Collections.singletonList(mockLog));
        when(validationService.getValidationLogs(eq("TK_DS"), eq("SUCCESS"), eq(1L), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/check-in/logs")
                        .param("search", "TK_DS")
                        .param("status", "SUCCESS")
                        .param("gateId", "1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].ticketCode").value("TK_DS_12345"));
    }

    @Test
    void testGetValidationStats() throws Exception {
        ValidationSummaryStatsDto statsDto = ValidationSummaryStatsDto.builder()
                .totalScans(10L)
                .successfulScans(8L)
                .failedScans(2L)
                .build();
        when(validationService.getValidationStats()).thenReturn(statsDto);

        mockMvc.perform(get("/api/v1/check-in/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalScans").value(10))
                .andExpect(jsonPath("$.data.successfulScans").value(8));
    }

    @Test
    void testClearValidationLogs() throws Exception {
        mockMvc.perform(post("/api/v1/check-in/clear"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Scan history cleared successfully"));
    }
}
