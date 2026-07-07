package com.gateos.module.payment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gateos.config.SecurityConfig;
import com.gateos.module.payment.service.VNPayService;
import com.gateos.security.JwtAuthenticationFilter;
import com.gateos.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PaymentController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VNPayService vnPayService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(username = "cust", roles = {"CUSTOMER"})
    void shouldCreatePaymentUrl_WithProxyHeader() throws Exception {
        // Arrange
        when(vnPayService.createPaymentUrl(eq("GOS-123"), eq("203.0.113.195")))
                .thenReturn("https://vnpay.vn/pay?vnp_TxnRef=GOS-123");

        // Act & Assert
        mockMvc.perform(post("/api/v1/payments/create-url")
                        .with(csrf())
                        .header("X-Forwarded-For", "203.0.113.195, 70.41.3.18")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("orderCode", "GOS-123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentUrl").value("https://vnpay.vn/pay?vnp_TxnRef=GOS-123"));
    }

    @Test
    @WithMockUser(username = "cust", roles = {"CUSTOMER"})
    void shouldCreatePaymentUrl_WithoutProxyHeader() throws Exception {
        // Arrange
        when(vnPayService.createPaymentUrl(eq("GOS-123"), any()))
                .thenReturn("https://vnpay.vn/pay?vnp_TxnRef=GOS-123");

        // Act & Assert
        mockMvc.perform(post("/api/v1/payments/create-url")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("orderCode", "GOS-123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void shouldProcessIPN_WhenAnonymous() throws Exception {
        // Arrange
        when(vnPayService.processIPN(any())).thenReturn(Map.of("RspCode", "00", "Message", "Confirm Success"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/payments/vnpay-ipn")
                        .param("vnp_TxnRef", "GOS-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("00"));
    }

    @Test
    @WithMockUser(username = "cust", roles = {"CUSTOMER"})
    void shouldReturnSuccess_WhenVNPayRedirectsWithResponseCode00() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/payments/vnpay-return")
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_TxnRef", "GOS-123")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Thanh toán thành công"))
                .andExpect(jsonPath("$.data.status").value("SUCCESS"));
    }

    @Test
    @WithMockUser(username = "cust", roles = {"CUSTOMER"})
    void shouldReturnFailed_WhenVNPayRedirectsWithOtherResponseCode() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/payments/vnpay-return")
                        .param("vnp_ResponseCode", "24")
                        .param("vnp_TxnRef", "GOS-123")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Thanh toán thất bại"))
                .andExpect(jsonPath("$.data.status").value("FAILED"));
    }
}
