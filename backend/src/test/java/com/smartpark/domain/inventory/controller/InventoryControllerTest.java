package com.smartpark.domain.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.inventory.dto.InventoryDto;
import com.smartpark.domain.inventory.entity.InventoryTransaction;
import com.smartpark.domain.inventory.service.InventoryService;
import com.smartpark.security.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InventoryController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class InventoryControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean InventoryService service;
    @MockBean JwtService jwtService;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean RateLimitFilter rateLimitFilter;

    @Test void adjustmentIsValidatedAndWrapped() throws Exception {
        InventoryDto.AdjustmentRequest request = InventoryDto.AdjustmentRequest.builder().sku("TSHIRT-001").shopId(2L)
                .adjustmentType(InventoryTransaction.TransactionType.INCREASE).quantity(5).reason("PURCHASE_RECEIPT").build();
        when(service.adjust(any())).thenReturn(InventoryDto.ItemResponse.builder().itemId(101L).sku("TSHIRT-001")
                .currentQuantity(15).reservedQuantity(0).availableQuantity(15).status("ACTIVE").build());
        mvc.perform(put("/api/v1/inventory").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.currentQuantity").value(15));
    }
}
