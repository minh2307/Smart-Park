package com.smartpark.domain.dashboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.dashboard.dto.DashboardSummaryDto;
import com.smartpark.domain.dashboard.dto.KpiCardDto;
import com.smartpark.domain.dashboard.dto.RevenueAnalyticsDto;
import com.smartpark.domain.dashboard.dto.VisitorFlowDto;
import com.smartpark.domain.dashboard.service.DashboardService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

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
        KpiCardDto card = KpiCardDto.builder()
                .value(100.0)
                .previousValue(90.0)
                .growthPercentage(11.11)
                .trend("UP")
                .sparklineData(List.of(80.0, 90.0, 100.0))
                .build();

        DashboardSummaryDto summary = DashboardSummaryDto.builder()
                .totalRevenue(card)
                .totalProfit(card)
                .totalVisitors(card)
                .ticketsSold(card)
                .averageRevenuePerVisitor(card)
                .parkingRevenue(card)
                .foodRevenue(card)
                .retailRevenue(card)
                .activeMemberships(card)
                .rideUtilization(card)
                .averageQueueTime(card)
                .rideAvailability(card)
                .customerSatisfaction(card)
                .employeeProductivity(card)
                .incidentCount(card)
                .build();

        when(dashboardService.getDashboardSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalRevenue.value").value(100.0))
                .andExpect(jsonPath("$.data.totalProfit.value").value(100.0))
                .andExpect(jsonPath("$.data.totalVisitors.value").value(100.0));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetRevenueAnalytics() throws Exception {
        RevenueAnalyticsDto analytics = RevenueAnalyticsDto.builder()
                .period("2026-07-10")
                .revenue(new BigDecimal("1000.00"))
                .cost(new BigDecimal("700.00"))
                .profit(new BigDecimal("300.00"))
                .build();

        when(dashboardService.getRevenueAnalytics(any(), any(), eq("DAY"))).thenReturn(List.of(analytics));

        mockMvc.perform(get("/api/v1/dashboard/revenue")
                        .param("startDate", "2026-07-01")
                        .param("endDate", "2026-07-10")
                        .param("groupBy", "DAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].period").value("2026-07-10"))
                .andExpect(jsonPath("$.data[0].revenue").value(1000.00))
                .andExpect(jsonPath("$.data[0].cost").value(700.00))
                .andExpect(jsonPath("$.data[0].profit").value(300.00));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetVisitorFlow() throws Exception {
        VisitorFlowDto flow = VisitorFlowDto.builder()
                .hour("08:00")
                .visitorCount(120L)
                .build();

        when(dashboardService.getVisitorFlow()).thenReturn(List.of(flow));

        mockMvc.perform(get("/api/v1/dashboard/visitors/flow"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].hour").value("08:00"))
                .andExpect(jsonPath("$.data[0].visitorCount").value(120));
    }
}
