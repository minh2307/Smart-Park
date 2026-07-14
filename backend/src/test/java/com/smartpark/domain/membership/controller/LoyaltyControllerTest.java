package com.smartpark.domain.membership.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.membership.dto.LoyaltyDto;
import com.smartpark.domain.membership.entity.PointHistory;
import com.smartpark.domain.membership.service.LoyaltyService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LoyaltyController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class LoyaltyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private LoyaltyService loyaltyService;

    @MockBean private JwtService jwtService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testEarnPoints() throws Exception {
        LoyaltyDto.EarnRequest request = new LoyaltyDto.EarnRequest(1L, 101L, BigDecimal.valueOf(100000), "purchase");
        LoyaltyDto.TransactionResponse response = LoyaltyDto.TransactionResponse.builder()
                .id(1L)
                .pointsEarned(10L)
                .transactionType(PointHistory.TransactionType.EARN)
                .build();

        when(loyaltyService.earnPoints(any(LoyaltyDto.EarnRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/loyalty/earn")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pointsEarned").value(10L));
    }

    @Test
    void testRedeemPoints() throws Exception {
        LoyaltyDto.RedeemRequest request = new LoyaltyDto.RedeemRequest(1L, 50L, 102L, "Redeem reward");
        LoyaltyDto.TransactionResponse response = LoyaltyDto.TransactionResponse.builder()
                .id(1L)
                .pointsRedeemed(50L)
                .transactionType(PointHistory.TransactionType.REDEEM)
                .build();

        when(loyaltyService.redeemPoints(any(LoyaltyDto.RedeemRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/loyalty/redeem")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pointsRedeemed").value(50L));
    }

    @Test
    void testAdjustPoints() throws Exception {
        LoyaltyDto.AdjustRequest request = new LoyaltyDto.AdjustRequest(1L, 20L, "Loyalty bonus", "admin");
        LoyaltyDto.TransactionResponse response = LoyaltyDto.TransactionResponse.builder()
                .id(1L)
                .pointsEarned(20L)
                .transactionType(PointHistory.TransactionType.ADJUST)
                .build();

        when(loyaltyService.adjustPoints(any(LoyaltyDto.AdjustRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/loyalty/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pointsEarned").value(20L));
    }
}
