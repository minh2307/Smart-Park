package com.smartpark.domain.locker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.locker.dto.LockerRentalRequestDto;
import com.smartpark.domain.locker.dto.LockerRentalResponseDto;
import com.smartpark.domain.locker.dto.LockerRentalReturnDto;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.service.LockerRentalService;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LockerRentalController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class LockerRentalControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LockerRentalService lockerRentalService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void findAllRentals_ShouldReturnPageOfRentalResponseDtos() throws Exception {
        LockerRentalResponseDto dto = LockerRentalResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .customerName("John Doe")
                .build();

        when(lockerRentalService.findAllRentals(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/v1/locker-rentals")
                .param("search", "John")
                .param("status", "ACTIVE")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].customerName").value("John Doe"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void findRentalById_ShouldReturnRentalResponseDto() throws Exception {
        LockerRentalResponseDto dto = LockerRentalResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .build();

        when(lockerRentalService.findRentalById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/locker-rentals/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_CUSTOMER"})
    void rentLocker_ShouldReturnRentalResponseDto() throws Exception {
        LockerRentalRequestDto request = LockerRentalRequestDto.builder()
                .lockerId(1L)
                .customerId(10L)
                .deposit(BigDecimal.valueOf(10000))
                .build();

        LockerRentalResponseDto response = LockerRentalResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .build();

        when(lockerRentalService.rentLocker(any(LockerRentalRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/locker-rentals/rent")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lockerCode").value("L-001"));
    }

    @Test
    @WithMockUser(authorities = {"ROLE_CUSTOMER"})
    void returnLocker_ShouldReturnRentalResponseDto() throws Exception {
        LockerRentalReturnDto request = LockerRentalReturnDto.builder()
                .rentalId(1L)
                .penalty(BigDecimal.valueOf(5000))
                .damageFee(BigDecimal.valueOf(10000))
                .build();

        LockerRentalResponseDto response = LockerRentalResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .status(LockerTransaction.LockerTransactionStatus.COMPLETED)
                .build();

        when(lockerRentalService.returnLocker(any(LockerRentalReturnDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/locker-rentals/return")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    @WithMockUser(username = "customer_user", authorities = {"ROLE_CUSTOMER"})
    void getMyCurrentRentals_ShouldReturnList() throws Exception {
        LockerRentalResponseDto dto = LockerRentalResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .build();

        when(lockerRentalService.findCurrentRentals("customer_user")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/locker-rentals/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].lockerCode").value("L-001"));
    }

    @Test
    @WithMockUser(username = "customer_user", authorities = {"ROLE_CUSTOMER"})
    void getMyRentalHistory_ShouldReturnPage() throws Exception {
        LockerRentalResponseDto dto = LockerRentalResponseDto.builder()
                .id(1L)
                .lockerCode("L-001")
                .build();

        when(lockerRentalService.findRentalHistory(eq("customer_user"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/v1/locker-rentals/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].lockerCode").value("L-001"));
    }
}
