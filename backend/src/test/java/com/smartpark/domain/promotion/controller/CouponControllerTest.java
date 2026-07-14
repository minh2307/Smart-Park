package com.smartpark.domain.promotion.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.promotion.dto.CouponRequestDto;
import com.smartpark.domain.promotion.dto.CouponResponseDto;
import com.smartpark.domain.promotion.entity.Coupon;
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
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CouponController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CouponControllerTest {

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
        lenient().when(promotionMapper.toResponse(any(Coupon.class))).thenAnswer(invocation -> {
            Coupon c = invocation.getArgument(0);
            if (c == null) return null;
            return CouponResponseDto.builder()
                    .id(c.getId())
                    .code(c.getCode())
                    .status(c.getStatus() != null ? c.getStatus().name() : null)
                    .discountAmount(c.getDiscountAmount())
                    .minOrderValue(c.getMinOrderValue())
                    .expirationDate(c.getExpirationDate())
                    .build();
        });
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetCoupons() throws Exception {
        Coupon coupon = new Coupon();
        coupon.setId(1L);
        coupon.setCode("COUP1");
        coupon.setStatus(Coupon.CouponStatus.ACTIVE);

        when(promotionService.findAllCoupons(any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(coupon)));

        mockMvc.perform(get("/api/v1/coupons"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].code").value("COUP1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetCouponById() throws Exception {
        Coupon coupon = new Coupon();
        coupon.setId(1L);
        coupon.setCode("COUP1");

        when(promotionService.findCouponById(1L)).thenReturn(coupon);

        mockMvc.perform(get("/api/v1/coupons/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("COUP1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateCoupon() throws Exception {
        CouponRequestDto request = CouponRequestDto.builder()
                .code("COUP1")
                .promotionId(1L)
                .customerId(100L)
                .maxUses(5)
                .discountAmount(BigDecimal.valueOf(10000))
                .minOrderValue(BigDecimal.valueOf(50000))
                .expirationDate(LocalDate.now().plusDays(5))
                .status("ACTIVE")
                .build();

        Coupon coupon = new Coupon();
        coupon.setId(1L);
        coupon.setCode("COUP1");

        when(promotionService.createCoupon(any(CouponRequestDto.class))).thenReturn(coupon);

        mockMvc.perform(post("/api/v1/coupons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("COUP1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateCoupon() throws Exception {
        CouponRequestDto request = CouponRequestDto.builder()
                .code("COUP1")
                .promotionId(1L)
                .customerId(100L)
                .maxUses(5)
                .discountAmount(BigDecimal.valueOf(10000))
                .minOrderValue(BigDecimal.valueOf(50000))
                .expirationDate(LocalDate.now().plusDays(5))
                .status("ACTIVE")
                .build();

        Coupon coupon = new Coupon();
        coupon.setId(1L);
        coupon.setCode("COUP1");

        when(promotionService.updateCoupon(eq(1L), any(CouponRequestDto.class))).thenReturn(coupon);

        mockMvc.perform(put("/api/v1/coupons/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("COUP1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteCoupon() throws Exception {
        mockMvc.perform(delete("/api/v1/coupons/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDisableCoupon() throws Exception {
        Coupon coupon = new Coupon();
        coupon.setId(1L);
        coupon.setStatus(Coupon.CouponStatus.DISABLED);

        when(promotionService.disableCoupon(1L)).thenReturn(coupon);

        mockMvc.perform(patch("/api/v1/coupons/1/disable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DISABLED"));
    }
}
