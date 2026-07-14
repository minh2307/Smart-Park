package com.smartpark.domain.locker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.locker.dto.LockerDashboardStatsDto;
import com.smartpark.domain.locker.dto.LockerRequestDto;
import com.smartpark.domain.locker.dto.LockerResponseDto;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.service.LockerService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import com.smartpark.security.RateLimitFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LockerController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class LockerControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LockerService lockerService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void findAllLockers_ShouldReturnPageOfLockerResponseDtos() throws Exception {
        LockerResponseDto dto = LockerResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .lockerNumber("Locker 001")
                .status(Locker.LockerStatus.AVAILABLE)
                .build();

        when(lockerService.findLockersWithFilters(any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/v1/lockers")
                .param("search", "L-001")
                .param("status", "AVAILABLE")
                .param("size", "MEDIUM")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].lockerCode").value("L-001"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void findLockerById_ShouldReturnLockerResponseDto() throws Exception {
        LockerResponseDto dto = LockerResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .build();

        when(lockerService.findLockerById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/lockers/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lockerCode").value("L-001"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void createLocker_ShouldReturnCreatedLockerResponseDto() throws Exception {
        LockerRequestDto request = LockerRequestDto.builder()
                .zoneId(1L)
                .lockerCode("L-001")
                .lockerNumber("Locker 001")
                .type("STANDARD")
                .rentalPrice(BigDecimal.valueOf(10000))
                .size(Locker.LockerSize.MEDIUM)
                .build();

        LockerResponseDto response = LockerResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .build();

        when(lockerService.createLockerDto(any(LockerRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/lockers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lockerCode").value("L-001"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void updateLocker_ShouldReturnUpdatedLockerResponseDto() throws Exception {
        LockerRequestDto request = LockerRequestDto.builder()
                .zoneId(1L)
                .lockerCode("L-001")
                .lockerNumber("Locker 001")
                .type("STANDARD")
                .rentalPrice(BigDecimal.valueOf(10000))
                .size(Locker.LockerSize.MEDIUM)
                .build();

        LockerResponseDto response = LockerResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .build();

        when(lockerService.updateLocker(eq(1L), any(LockerRequestDto.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/lockers/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lockerCode").value("L-001"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void deleteLocker_ShouldReturnSuccessMessage() throws Exception {
        doNothing().when(lockerService).deleteLocker(1L);

        mockMvc.perform(delete("/api/v1/lockers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Xóa tủ đồ thành công."));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void updateLockerStatus_ShouldReturnUpdatedLockerResponseDto() throws Exception {
        LockerResponseDto response = LockerResponseDto.builder()
                .id(1L)
                .status(Locker.LockerStatus.OCCUPIED)
                .build();

        when(lockerService.updateLockerStatus(1L, Locker.LockerStatus.OCCUPIED)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/lockers/1/status")
                .param("status", "OCCUPIED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("OCCUPIED"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void getLockerStatistics_ShouldReturnStats() throws Exception {
        LockerDashboardStatsDto stats = LockerDashboardStatsDto.builder()
                .totalLockers(10)
                .revenue(BigDecimal.valueOf(50000))
                .build();

        when(lockerService.getLockerStatistics()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/lockers/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalLockers").value(10));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void findAllLockersLegacy_ShouldReturnPageOfLockers() throws Exception {
        Locker l = new Locker();
        l.setId(1L);
        when(lockerService.findAllLockers(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(l)));

        mockMvc.perform(get("/api/v1/lockers/legacy"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void createLockerLegacy_ShouldReturnLocker() throws Exception {
        Locker l = new Locker();
        l.setId(1L);
        when(lockerService.createLocker(any(Locker.class))).thenReturn(l);

        mockMvc.perform(post("/api/v1/lockers/legacy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(l)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void findAllTransactions_ShouldReturnPageOfTransactions() throws Exception {
        LockerTransaction tx = new LockerTransaction();
        tx.setId(1L);
        when(lockerService.findAllTransactions(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(tx)));

        mockMvc.perform(get("/api/v1/lockers/transactions"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void createTransaction_ShouldReturnTransaction() throws Exception {
        LockerTransaction tx = new LockerTransaction();
        tx.setId(1L);
        when(lockerService.createTransaction(any(LockerTransaction.class))).thenReturn(tx);

        mockMvc.perform(post("/api/v1/lockers/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tx)))
                .andExpect(status().isOk());
    }
}
