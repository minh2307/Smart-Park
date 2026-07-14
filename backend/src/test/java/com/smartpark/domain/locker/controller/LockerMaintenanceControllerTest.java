package com.smartpark.domain.locker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.locker.dto.LockerMaintenanceRequestDto;
import com.smartpark.domain.locker.dto.LockerMaintenanceResponseDto;
import com.smartpark.domain.locker.entity.LockerMaintenance;
import com.smartpark.domain.locker.service.LockerMaintenanceService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import com.smartpark.security.RateLimitFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LockerMaintenanceController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class LockerMaintenanceControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LockerMaintenanceService lockerMaintenanceService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void findAllMaintenances_ShouldReturnPage() throws Exception {
        LockerMaintenanceResponseDto dto = LockerMaintenanceResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .technician("Bob")
                .build();

        when(lockerMaintenanceService.findAllMaintenances(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/v1/locker-maintenances")
                .param("search", "Bob")
                .param("status", "SCHEDULED")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].technician").value("Bob"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void createMaintenance_ShouldReturnCreatedResponse() throws Exception {
        LockerMaintenanceRequestDto request = LockerMaintenanceRequestDto.builder()
                .lockerId(1L)
                .maintenanceDate(LocalDateTime.now())
                .reason("Damaged door")
                .technician("Alice")
                .maintenanceStatus(LockerMaintenance.MaintenanceStatus.SCHEDULED)
                .build();

        LockerMaintenanceResponseDto response = LockerMaintenanceResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .build();

        when(lockerMaintenanceService.createMaintenance(any(LockerMaintenanceRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/locker-maintenances")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lockerCode").value("L-001"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void updateMaintenance_ShouldReturnUpdatedResponse() throws Exception {
        LockerMaintenanceRequestDto request = LockerMaintenanceRequestDto.builder()
                .lockerId(1L)
                .maintenanceDate(LocalDateTime.now())
                .reason("Damaged door")
                .technician("Alice")
                .maintenanceStatus(LockerMaintenance.MaintenanceStatus.SCHEDULED)
                .build();

        LockerMaintenanceResponseDto response = LockerMaintenanceResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .build();

        when(lockerMaintenanceService.updateMaintenance(eq(1L), any(LockerMaintenanceRequestDto.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/locker-maintenances/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lockerCode").value("L-001"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void completeMaintenance_ShouldReturnCompletedResponse() throws Exception {
        LockerMaintenanceResponseDto response = LockerMaintenanceResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .maintenanceStatus(LockerMaintenance.MaintenanceStatus.COMPLETED)
                .build();

        when(lockerMaintenanceService.completeMaintenance(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/locker-maintenances/1/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.maintenanceStatus").value("COMPLETED"));
    }
}
