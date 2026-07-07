package com.gateos.module.dashboard.controller;

import com.gateos.config.SecurityConfig;
import com.gateos.module.checkin.repository.CheckInRepository;
import com.gateos.module.order.repository.OrderRepository;
import com.gateos.module.ticket.repository.TicketRepository;
import com.gateos.security.JwtAuthenticationFilter;
import com.gateos.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DashboardController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private CheckInRepository checkInRepository;

    @MockBean
    private TicketRepository ticketRepository;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldGetSummary_WhenRevenueIsNotNull() throws Exception {
        // Arrange
        when(orderRepository.sumRevenueBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(1500000));
        when(orderRepository.countPaidBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(5L);
        when(checkInRepository.countSuccessBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(8L);

        // Act & Assert
        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.todayRevenue").value(1500000))
                .andExpect(jsonPath("$.data.todayOrders").value(5))
                .andExpect(jsonPath("$.data.todayCheckIns").value(8));
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldGetSummary_WhenRevenueIsNull() throws Exception {
        // Arrange
        when(orderRepository.sumRevenueBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(null);
        when(orderRepository.countPaidBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(0L);
        when(checkInRepository.countSuccessBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(0L);

        // Act & Assert
        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.todayRevenue").value(0))
                .andExpect(jsonPath("$.data.todayOrders").value(0))
                .andExpect(jsonPath("$.data.todayCheckIns").value(0));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    void shouldReturn403_WhenGetSummaryAsCustomer() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldGetRevenueReport_WhenDateRangeIsValid() throws Exception {
        // Arrange
        LocalDate from = LocalDate.now().minusDays(7);
        LocalDate to = LocalDate.now();

        when(orderRepository.sumRevenueBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(5000000));
        when(orderRepository.countPaidBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(25L);

        // Act & Assert
        mockMvc.perform(get("/api/v1/dashboard/revenue")
                        .param("from", from.toString())
                        .param("to", to.toString())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRevenue").value(5000000))
                .andExpect(jsonPath("$.data.orderCount").value(25))
                .andExpect(jsonPath("$.data.from").value(from.toString()))
                .andExpect(jsonPath("$.data.to").value(to.toString()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldGetCheckInStats_ForVariousPeriods() throws Exception {
        // Arrange
        when(checkInRepository.countSuccessBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(120L);

        // Act & Assert: WEEK
        mockMvc.perform(get("/api/v1/dashboard/check-in")
                        .param("period", "WEEK")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.checkInCount").value(120))
                .andExpect(jsonPath("$.data.period").value("WEEK"));

        // Act & Assert: MONTH
        mockMvc.perform(get("/api/v1/dashboard/check-in")
                        .param("period", "MONTH")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.checkInCount").value(120))
                .andExpect(jsonPath("$.data.period").value("MONTH"));

        // Act & Assert: Default / TODAY
        mockMvc.perform(get("/api/v1/dashboard/check-in")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.checkInCount").value(120))
                .andExpect(jsonPath("$.data.period").value("TODAY"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldGetTicketStats() throws Exception {
        // Arrange
        when(ticketRepository.count()).thenReturn(1000L);
        when(ticketRepository.countByCustomerIdAndStatus(anyLong(), any()))
                .thenReturn(450L);

        // Act & Assert
        mockMvc.perform(get("/api/v1/dashboard/tickets")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalTickets").value(1000))
                .andExpect(jsonPath("$.data.usedTickets").value(450));
    }
}
