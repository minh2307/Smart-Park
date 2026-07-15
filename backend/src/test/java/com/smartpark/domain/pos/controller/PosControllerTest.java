package com.smartpark.domain.pos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.pos.dto.PosCheckoutDto;
import com.smartpark.domain.pos.service.PosCheckoutService;
import com.smartpark.security.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PosController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class PosControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean PosCheckoutService service;
    @MockBean JwtService jwtService;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean RateLimitFilter rateLimitFilter;

    @Test void checkoutUsesStandardEnvelope() throws Exception {
        PosCheckoutDto.CheckoutRequest request = PosCheckoutDto.CheckoutRequest.builder().terminalId("POS-01")
                .parkId(1L).customerId(15L).paymentMethodCode("CASH").items(List.of(
                        PosCheckoutDto.ItemRequest.builder().itemType(PosCheckoutDto.ItemType.RETAIL)
                                .referenceId(101L).sku("TSHIRT-001").quantity(2).build())).build();
        when(service.checkout(eq("key-1"), any())).thenReturn(PosCheckoutDto.CheckoutResponse.builder()
                .orderId(1001L).paymentStatus("SUCCESS").receiptNumber("REC-1").build());
        mvc.perform(post("/api/v1/pos/checkout").header("Idempotency-Key", "key-1")
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.data.orderId").value(1001));
    }
}
