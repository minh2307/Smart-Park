package com.smartpark.domain.bi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.bi.dto.BiDto;
import com.smartpark.domain.bi.service.BiService;
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

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BiController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class BiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BiService biService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetDashboardSummary() throws Exception {
        BiDto.DashboardSummary summary = BiDto.DashboardSummary.builder()
                .todayRevenue(new BigDecimal("1000000"))
                .todayVisitors(500L)
                .pendingBookings(10L)
                .build();

        when(biService.getDashboardSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/bi/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.todayRevenue").value(1000000))
                .andExpect(jsonPath("$.data.todayVisitors").value(500))
                .andExpect(jsonPath("$.data.pendingBookings").value(10));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetDailyRevenue() throws Exception {
        BiDto.RevenueResponse res = BiDto.RevenueResponse.builder().totalRevenue(new BigDecimal("50000")).build();
        when(biService.getDailyRevenue(any())).thenReturn(res);
        mockMvc.perform(get("/api/v1/bi/revenue/daily"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetMonthlyRevenue() throws Exception {
        BiDto.RevenueResponse res = BiDto.RevenueResponse.builder().totalRevenue(new BigDecimal("500000")).build();
        when(biService.getMonthlyRevenue(anyInt(), anyInt())).thenReturn(res);
        mockMvc.perform(get("/api/v1/bi/revenue/monthly"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetRevenueByTicketType() throws Exception {
        when(biService.getRevenueByTicketType(any(), any())).thenReturn(java.util.Collections.emptyList());
        mockMvc.perform(get("/api/v1/bi/revenue/by-ticket-type"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetDailyVisitors() throws Exception {
        BiDto.VisitorResponse res = BiDto.VisitorResponse.builder().visitorCount(100).build();
        when(biService.getDailyVisitors(any())).thenReturn(res);
        mockMvc.perform(get("/api/v1/bi/visitors/daily"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetPeakHours() throws Exception {
        when(biService.getPeakHours(any())).thenReturn(java.util.Collections.emptyList());
        mockMvc.perform(get("/api/v1/bi/operations/peak-hours"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetTopSpenders() throws Exception {
        when(biService.getTopSpenders(anyInt())).thenReturn(java.util.Collections.emptyList());
        mockMvc.perform(get("/api/v1/bi/customers/top-spenders"))
                .andExpect(status().isOk());
    }
}
