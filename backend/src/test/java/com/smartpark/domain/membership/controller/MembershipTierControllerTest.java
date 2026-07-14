package com.smartpark.domain.membership.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.membership.dto.MembershipTierDto;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.service.MembershipTierService;
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

@WebMvcTest(MembershipTierController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class MembershipTierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private MembershipTierService tierService;

    @MockBean private JwtService jwtService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetTiers() throws Exception {
        MembershipTierDto.Response response = MembershipTierDto.Response.builder()
                .id(1L)
                .code("GOLD")
                .name("Gold Tier")
                .status(MembershipTier.TierStatus.ACTIVE)
                .build();

        when(tierService.getAll(any(), any(), any())).thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/v1/membership-tiers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].code").value("GOLD"));
    }

    @Test
    void testCreateTier() throws Exception {
        MembershipTierDto.CreateRequest request = new MembershipTierDto.CreateRequest(
                "GOLD", "Gold Tier", "Benefits", BigDecimal.valueOf(5000000),
                BigDecimal.valueOf(10), BigDecimal.valueOf(1.5), true, true, "Gift", false, 1
        );

        MembershipTierDto.Response response = MembershipTierDto.Response.builder()
                .id(1L)
                .code("GOLD")
                .name("Gold Tier")
                .build();

        when(tierService.create(any(MembershipTierDto.CreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/membership-tiers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("GOLD"));
    }
}
