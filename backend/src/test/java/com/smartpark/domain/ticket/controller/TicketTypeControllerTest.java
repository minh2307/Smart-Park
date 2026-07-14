package com.smartpark.domain.ticket.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.ticket.dto.TicketTypeRequestDto;
import com.smartpark.domain.ticket.dto.TicketTypeResponseDto;
import com.smartpark.domain.ticket.service.TicketTypeService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TicketTypeController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class TicketTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketTypeService ticketTypeService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    private TicketTypeRequestDto mockRequest;
    private TicketTypeResponseDto mockResponse;

    @BeforeEach
    void setup() {
        mockRequest = TicketTypeRequestDto.builder()
                .venueId(1L)
                .name("Adult Standard Ticket")
                .description("Standard daily entry for adults")
                .price(new BigDecimal("150000"))
                .minPrice(new BigDecimal("100000"))
                .maxPrice(new BigDecimal("200000"))
                .totalQuantity(100)
                .type("ADULT")
                .status("ACTIVE")
                .build();

        mockResponse = TicketTypeResponseDto.builder()
                .id(1L)
                .venueId(1L)
                .name("Adult Standard Ticket")
                .description("Standard daily entry for adults")
                .price(new BigDecimal("150000"))
                .minPrice(new BigDecimal("100000"))
                .maxPrice(new BigDecimal("200000"))
                .totalQuantity(100)
                .availableQuantity(100)
                .type("ADULT")
                .status("ACTIVE")
                .build();
    }

    @Test
    void testCreateTicketType() throws Exception {
        when(ticketTypeService.createTicketType(any(TicketTypeRequestDto.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/ticket-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.data.name").value("Adult Standard Ticket"));
    }

    @Test
    void testUpdateTicketType() throws Exception {
        when(ticketTypeService.updateTicketType(eq(1L), any(TicketTypeRequestDto.class))).thenReturn(mockResponse);

        mockMvc.perform(put("/api/v1/ticket-types/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Adult Standard Ticket"));
    }

    @Test
    void testDeleteTicketType() throws Exception {
        mockMvc.perform(delete("/api/v1/ticket-types/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Ticket type deleted successfully"));
    }

    @Test
    void testGetTicketTypeById() throws Exception {
        when(ticketTypeService.getTicketTypeById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/ticket-types/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void testGetAllTicketTypes() throws Exception {
        PageImpl<TicketTypeResponseDto> page = new PageImpl<>(Collections.singletonList(mockResponse));
        when(ticketTypeService.getAllTicketTypes(eq("Adult"), eq("ACTIVE"), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/ticket-types")
                        .param("search", "Adult")
                        .param("status", "ACTIVE")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Adult Standard Ticket"));
    }
}
