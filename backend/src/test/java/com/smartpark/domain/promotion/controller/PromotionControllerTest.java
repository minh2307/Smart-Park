package com.smartpark.domain.promotion.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.promotion.dto.PromotionRequestDto;
import com.smartpark.domain.promotion.dto.PromotionResponseDto;
import com.smartpark.domain.promotion.dto.PromotionValidateRequestDto;
import com.smartpark.domain.promotion.entity.Promotion;
import com.smartpark.domain.promotion.mapper.PromotionMapper;
import com.smartpark.domain.promotion.service.PromotionService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PromotionController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class PromotionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PromotionService promotionService;

    @MockBean
    private PromotionMapper promotionMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        lenient().when(promotionMapper.toResponse(any(Promotion.class))).thenAnswer(invocation -> {
            Promotion p = invocation.getArgument(0);
            if (p == null) return null;
            return PromotionResponseDto.builder()
                    .id(p.getId())
                    .code(p.getCode())
                    .name(p.getName())
                    .description(p.getDescription())
                    .discountType(p.getDiscountType() != null ? p.getDiscountType().name() : null)
                    .value(p.getValue())
                    .startDate(p.getStartDate())
                    .endDate(p.getEndDate())
                    .status(p.getStatus() != null ? p.getStatus().name() : null)
                    .build();
        });
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetPromotions() throws Exception {
        Promotion promotion = new Promotion();
        promotion.setId(1L);
        promotion.setCode("PROMO1");
        promotion.setStatus(Promotion.PromotionStatus.ACTIVE);

        when(promotionService.findAllPromotions(any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(promotion)));

        mockMvc.perform(get("/api/v1/promotions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].code").value("PROMO1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetPromotionById() throws Exception {
        Promotion promotion = new Promotion();
        promotion.setId(1L);
        promotion.setCode("PROMO1");

        when(promotionService.findPromotionById(1L)).thenReturn(promotion);

        mockMvc.perform(get("/api/v1/promotions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("PROMO1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreatePromotion() throws Exception {
        PromotionRequestDto request = PromotionRequestDto.builder()
                .code("PROMO1")
                .name("Promo 1")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .discountType("FIXED_AMOUNT")
                .value(BigDecimal.valueOf(10000))
                .campaignId(10L)
                .status("ACTIVE")
                .build();

        Promotion promotion = new Promotion();
        promotion.setId(1L);
        promotion.setCode("PROMO1");

        when(promotionService.createPromotion(any(PromotionRequestDto.class))).thenReturn(promotion);

        mockMvc.perform(post("/api/v1/promotions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("PROMO1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdatePromotion() throws Exception {
        PromotionRequestDto request = PromotionRequestDto.builder()
                .code("PROMO1")
                .name("Promo 1")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .discountType("FIXED_AMOUNT")
                .value(BigDecimal.valueOf(10000))
                .campaignId(10L)
                .status("ACTIVE")
                .build();

        Promotion promotion = new Promotion();
        promotion.setId(1L);
        promotion.setCode("PROMO1");

        when(promotionService.updatePromotion(eq(1L), any(PromotionRequestDto.class))).thenReturn(promotion);

        mockMvc.perform(put("/api/v1/promotions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("PROMO1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeletePromotion() throws Exception {
        mockMvc.perform(delete("/api/v1/promotions/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testActivatePromotion() throws Exception {
        Promotion promotion = new Promotion();
        promotion.setId(1L);
        promotion.setStatus(Promotion.PromotionStatus.ACTIVE);

        when(promotionService.activatePromotion(1L)).thenReturn(promotion);

        mockMvc.perform(patch("/api/v1/promotions/1/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeactivatePromotion() throws Exception {
        Promotion promotion = new Promotion();
        promotion.setId(1L);
        promotion.setStatus(Promotion.PromotionStatus.INACTIVE);

        when(promotionService.deactivatePromotion(1L)).thenReturn(promotion);

        mockMvc.perform(patch("/api/v1/promotions/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testValidatePromotion() throws Exception {
        PromotionValidateRequestDto request = PromotionValidateRequestDto.builder()
                .code("PROMO1")
                .customerId(100L)
                .orderTotal(BigDecimal.valueOf(200000))
                .ticketTypeIds(Arrays.asList(1L, 2L))
                .build();

        when(promotionService.validateAndCalculatePromotion(eq("PROMO1"), eq(100L), any(BigDecimal.class), any()))
                .thenReturn(BigDecimal.valueOf(20000));

        mockMvc.perform(post("/api/v1/promotions/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(20000));
    }
}
