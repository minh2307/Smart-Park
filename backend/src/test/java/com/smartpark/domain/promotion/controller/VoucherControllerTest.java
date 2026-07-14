package com.smartpark.domain.promotion.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.promotion.dto.VoucherRequestDto;
import com.smartpark.domain.promotion.dto.VoucherResponseDto;
import com.smartpark.domain.promotion.dto.VoucherRedeemRequestDto;
import com.smartpark.domain.promotion.service.VoucherService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
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
import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(VoucherController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class VoucherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VoucherService voucherService;

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
    void testGetVouchers() throws Exception {
        VoucherResponseDto response = VoucherResponseDto.builder()
                .id(1L)
                .code("VOUCH1")
                .status("ACTIVE")
                .build();

        when(voucherService.findAll(any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(response)));

        mockMvc.perform(get("/api/v1/vouchers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].code").value("VOUCH1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetVoucherById() throws Exception {
        VoucherResponseDto response = VoucherResponseDto.builder()
                .id(1L)
                .code("VOUCH1")
                .status("ACTIVE")
                .build();

        when(voucherService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/vouchers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("VOUCH1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateVoucher() throws Exception {
        VoucherRequestDto request = VoucherRequestDto.builder()
                .code("VOUCH1")
                .voucherValue(BigDecimal.valueOf(100000))
                .validFrom(LocalDate.now())
                .validTo(LocalDate.now().plusDays(10))
                .customerId(100L)
                .status("ACTIVE")
                .build();

        VoucherResponseDto response = VoucherResponseDto.builder()
                .id(1L)
                .code("VOUCH1")
                .status("ACTIVE")
                .build();

        when(voucherService.create(any(VoucherRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/vouchers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("VOUCH1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateVoucher() throws Exception {
        VoucherRequestDto request = VoucherRequestDto.builder()
                .code("VOUCH1")
                .voucherValue(BigDecimal.valueOf(100000))
                .validFrom(LocalDate.now())
                .validTo(LocalDate.now().plusDays(10))
                .customerId(100L)
                .status("ACTIVE")
                .build();

        VoucherResponseDto response = VoucherResponseDto.builder()
                .id(1L)
                .code("VOUCH1")
                .status("ACTIVE")
                .build();

        when(voucherService.update(eq(1L), any(VoucherRequestDto.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/vouchers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("VOUCH1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteVoucher() throws Exception {
        mockMvc.perform(delete("/api/v1/vouchers/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testValidateVoucher() throws Exception {
        when(voucherService.validate(eq("VOUCH1"), eq(100L), any(BigDecimal.class)))
                .thenReturn(BigDecimal.valueOf(50000));

        mockMvc.perform(get("/api/v1/vouchers/validate")
                        .param("code", "VOUCH1")
                        .param("customerId", "100")
                        .param("orderTotal", "100000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(50000));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testRedeemVoucher() throws Exception {
        VoucherRedeemRequestDto request = VoucherRedeemRequestDto.builder()
                .code("VOUCH1")
                .customerId(100L)
                .redeemAmount(BigDecimal.valueOf(50000))
                .bookingId(1L)
                .build();

        VoucherResponseDto response = VoucherResponseDto.builder()
                .id(1L)
                .code("VOUCH1")
                .status("ACTIVE")
                .build();

        when(voucherService.redeem(any(VoucherRedeemRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/vouchers/redeem")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("VOUCH1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDisableVoucher() throws Exception {
        VoucherResponseDto response = VoucherResponseDto.builder()
                .id(1L)
                .status("DISABLED")
                .build();

        when(voucherService.disable(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/vouchers/1/disable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DISABLED"));
    }
}
