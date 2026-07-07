package com.gateos.module.tickettype.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gateos.config.SecurityConfig;
import com.gateos.module.tickettype.dto.TicketTypeRequest;
import com.gateos.module.tickettype.entity.TicketType;
import com.gateos.module.tickettype.service.TicketTypeService;
import com.gateos.security.JwtAuthenticationFilter;
import com.gateos.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TicketTypeController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class TicketTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TicketTypeService ticketTypeService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void shouldGetAllTicketTypes_WhenAnonymous() throws Exception {
        // Arrange
        when(ticketTypeService.getAll(eq(1L), eq("ACTIVE"), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(TicketType.builder().id(5L).name("Standard").build())));

        // Act & Assert
        mockMvc.perform(get("/api/v1/ticket-types")
                        .param("venueId", "1")
                        .param("status", "ACTIVE")
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Standard"));
    }

    @Test
    void shouldGetByVenue_WhenAnonymous() throws Exception {
        // Arrange
        when(ticketTypeService.getAll(eq(1L), eq(null), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(TicketType.builder().id(5L).name("Standard").build())));

        // Act & Assert
        mockMvc.perform(get("/api/v1/venues/1/ticket-types")
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Standard"));
    }

    @Test
    void shouldGetTicketTypeById_WhenAnonymous() throws Exception {
        // Arrange
        when(ticketTypeService.getById(5L))
                .thenReturn(TicketType.builder().id(5L).name("Standard").price(BigDecimal.valueOf(100000)).build());

        // Act & Assert
        mockMvc.perform(get("/api/v1/ticket-types/5")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Standard"));
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldCreateTicketType_WhenManager() throws Exception {
        // Arrange
        TicketTypeRequest request = new TicketTypeRequest();
        request.setVenueId(1L);
        request.setName("Combo VIP");
        request.setType(TicketType.TicketCategory.COMBO);
        request.setPrice(BigDecimal.valueOf(250000));
        request.setValidDays(3);

        TicketType saved = TicketType.builder().id(8L).name("Combo VIP").build();
        when(ticketTypeService.create(any(TicketTypeRequest.class))).thenReturn(saved);

        // Act & Assert
        mockMvc.perform(post("/api/v1/ticket-types")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(8));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    void shouldReturn403_WhenCreateTicketTypeAsCustomer() throws Exception {
        // Arrange
        TicketTypeRequest request = new TicketTypeRequest();
        request.setVenueId(1L);
        request.setName("Combo VIP");
        request.setType(TicketType.TicketCategory.COMBO);
        request.setPrice(BigDecimal.valueOf(250000));

        // Act & Assert
        mockMvc.perform(post("/api/v1/ticket-types")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldReturn422_WhenCreateTicketTypeIsInvalid() throws Exception {
        // Arrange
        TicketTypeRequest request = new TicketTypeRequest();
        request.setVenueId(null); // Invalid
        request.setName(""); // Blank
        request.setType(null); // Invalid
        request.setPrice(BigDecimal.valueOf(-1000)); // Negative

        // Act & Assert
        mockMvc.perform(post("/api/v1/ticket-types")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR-VALIDATION-001"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldUpdateTicketType_WhenAdmin() throws Exception {
        // Arrange
        TicketTypeRequest request = new TicketTypeRequest();
        request.setVenueId(1L);
        request.setName("Updated Standard");
        request.setType(TicketType.TicketCategory.ENTRY);
        request.setPrice(BigDecimal.valueOf(110000));
        request.setValidDays(1);

        TicketType updated = TicketType.builder().id(5L).name("Updated Standard").build();
        when(ticketTypeService.update(eq(5L), any(TicketTypeRequest.class))).thenReturn(updated);

        // Act & Assert
        mockMvc.perform(put("/api/v1/ticket-types/5")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Standard"));
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldDeleteTicketType_WhenManager() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/v1/ticket-types/5")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(ticketTypeService).softDelete(5L);
    }
}
