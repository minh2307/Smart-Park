package com.smartpark.domain.promotion.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.promotion.dto.CampaignRequestDto;
import com.smartpark.domain.promotion.dto.CampaignResponseDto;
import com.smartpark.domain.promotion.dto.CampaignStatisticsDto;
import com.smartpark.domain.promotion.service.CampaignService;
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

@WebMvcTest(CampaignController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CampaignControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CampaignService campaignService;

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
    void testGetCampaigns() throws Exception {
        CampaignResponseDto response = CampaignResponseDto.builder()
                .id(1L)
                .code("CAMP1")
                .name("Campaign 1")
                .status("ACTIVE")
                .build();

        when(campaignService.findAll(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(response)));

        mockMvc.perform(get("/api/v1/campaigns"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].code").value("CAMP1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetCampaignById() throws Exception {
        CampaignResponseDto response = CampaignResponseDto.builder()
                .id(1L)
                .code("CAMP1")
                .name("Campaign 1")
                .status("ACTIVE")
                .build();

        when(campaignService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/campaigns/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("CAMP1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateCampaign() throws Exception {
        CampaignRequestDto request = CampaignRequestDto.builder()
                .code("CAMP1")
                .name("Campaign 1")
                .campaignType("SEASONAL")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .status("ACTIVE")
                .build();

        CampaignResponseDto response = CampaignResponseDto.builder()
                .id(1L)
                .code("CAMP1")
                .name("Campaign 1")
                .status("ACTIVE")
                .build();

        when(campaignService.create(any(CampaignRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/campaigns")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("CAMP1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateCampaign() throws Exception {
        CampaignRequestDto request = CampaignRequestDto.builder()
                .code("CAMP1")
                .name("Campaign 1")
                .campaignType("SEASONAL")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .status("ACTIVE")
                .build();

        CampaignResponseDto response = CampaignResponseDto.builder()
                .id(1L)
                .code("CAMP1")
                .name("Campaign 1")
                .status("ACTIVE")
                .build();

        when(campaignService.update(eq(1L), any(CampaignRequestDto.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/campaigns/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("CAMP1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteCampaign() throws Exception {
        mockMvc.perform(delete("/api/v1/campaigns/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testActivateCampaign() throws Exception {
        CampaignResponseDto response = CampaignResponseDto.builder()
                .id(1L)
                .status("ACTIVE")
                .build();

        when(campaignService.activate(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/campaigns/1/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeactivateCampaign() throws Exception {
        CampaignResponseDto response = CampaignResponseDto.builder()
                .id(1L)
                .status("INACTIVE")
                .build();

        when(campaignService.deactivate(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/campaigns/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetStatistics() throws Exception {
        CampaignStatisticsDto stats = CampaignStatisticsDto.builder()
                .totalCampaigns(5L)
                .activeCampaigns(2L)
                .totalBudget(BigDecimal.valueOf(5000000))
                .totalCouponUsages(10L)
                .totalCouponDiscounts(BigDecimal.valueOf(100000))
                .build();

        when(campaignService.getStatistics()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/campaigns/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalCampaigns").value(5))
                .andExpect(jsonPath("$.data.totalBudget").value(5000000));
    }
}
