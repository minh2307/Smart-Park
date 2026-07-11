package com.smartpark.domain.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.order.dto.PaymentDto;
import com.smartpark.domain.order.entity.Refund;
import com.smartpark.domain.order.service.PaymentService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void testCreatePayment() throws Exception {
        PaymentDto.PaymentRequest request = new PaymentDto.PaymentRequest();
        request.setOrderCode("ORD-123");
        request.setPaymentMethodCode("VNPAY");

        PaymentDto.PaymentResponse response = new PaymentDto.PaymentResponse();
        response.setPaymentUrl("http://vnpay.vn");

        when(paymentService.createPayment(any(PaymentDto.PaymentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentUrl").value("http://vnpay.vn"));
    }

    @Test
    void testVnpayIpn() throws Exception {
        when(paymentService.processVNPayIpn(any())).thenReturn("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");

        mockMvc.perform(get("/api/v1/payments/vnpay-ipn?vnp_Amount=50000000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("00"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testApproveRefund() throws Exception {
        Refund refund = Refund.builder()
                .id(1L)
                .amount(new BigDecimal("500000"))
                .status(Refund.RefundStatus.APPROVED)
                .build();

        when(paymentService.approveRefund(1L)).thenReturn(refund);

        mockMvc.perform(post("/api/v1/payments/refunds/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1L));
    }
}
