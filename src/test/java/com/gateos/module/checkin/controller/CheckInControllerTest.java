package com.gateos.module.checkin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gateos.config.SecurityConfig;
import com.gateos.module.checkin.entity.CheckIn;
import com.gateos.module.checkin.service.CheckInService;
import com.gateos.security.JwtAuthenticationFilter;
import com.gateos.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CheckInController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class CheckInControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CheckInService checkInService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(username = "staff", roles = {"GATE_STAFF"})
    void shouldScanTicketSuccessfully_WhenStaffAndTicketValid() throws Exception {
        // Arrange
        Map<String, Object> body = new HashMap<>();
        body.put("ticketCode", "GOS-123");
        body.put("gateStaffId", 10);
        body.put("attractionId", 20);

        Map<String, Object> serviceResult = Map.of("success", true, "code", "SUCCESS", "message", "OK");
        when(checkInService.scan("GOS-123", 10L, 20L)).thenReturn(serviceResult);

        // Act & Assert
        mockMvc.perform(post("/api/v1/check-in/scan")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Check-in thành công"));

        verify(checkInService).scan("GOS-123", 10L, 20L);
    }

    @Test
    @WithMockUser(username = "staff", roles = {"GATE_STAFF"})
    void shouldScanTicketFailed_WhenTicketInvalid() throws Exception {
        // Arrange
        Map<String, Object> body = new HashMap<>();
        body.put("ticketCode", "GOS-123");
        body.put("gateStaffId", null);
        body.put("attractionId", null);

        Map<String, Object> serviceResult = Map.of("success", false, "code", "EXPIRED", "message", "Expired ticket");
        when(checkInService.scan("GOS-123", null, null)).thenReturn(serviceResult);

        // Act & Assert
        mockMvc.perform(post("/api/v1/check-in/scan")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Check-in thất bại"));

        verify(checkInService).scan("GOS-123", null, null);
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    void shouldReturn403_WhenScanAsCustomer() throws Exception {
        // Arrange
        Map<String, Object> body = Map.of("ticketCode", "GOS-123");

        // Act & Assert
        mockMvc.perform(post("/api/v1/check-in/scan")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldManualOverride_WhenManager() throws Exception {
        // Arrange
        Map<String, String> body = Map.of("ticketCode", "GOS-123", "reason", "Forced open");
        Map<String, Object> serviceResult = Map.of("success", true, "code", "OVERRIDE");
        when(checkInService.manualOverride("GOS-123", 1L, "Forced open")).thenReturn(serviceResult);

        // Act & Assert
        mockMvc.perform(post("/api/v1/check-in/manual")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(checkInService).manualOverride("GOS-123", 1L, "Forced open");
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldGetHistory_WhenAdmin() throws Exception {
        // Arrange
        when(checkInService.getHistory(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(new CheckIn())));

        // Act & Assert
        mockMvc.perform(get("/api/v1/check-in/history")
                        .param("page", "0")
                        .param("size", "50")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
