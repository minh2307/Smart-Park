package com.gateos.module.ticket.controller;

import com.gateos.config.SecurityConfig;
import com.gateos.module.ticket.entity.Ticket;
import com.gateos.module.ticket.service.TicketService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TicketController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketService ticketService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(username = "cust", roles = {"CUSTOMER"})
    void shouldGetMyTickets_WhenCustomer() throws Exception {
        // Arrange
        when(ticketService.getMyTickets(eq(1L), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(Ticket.builder().id(10L).ticketCode("GOS-123").build())));

        // Act & Assert
        mockMvc.perform(get("/api/v1/customers/me/tickets")
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].ticketCode").value("GOS-123"));

        verify(ticketService).getMyTickets(eq(1L), any(PageRequest.class));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldReturn403_WhenGetMyTicketsAsAdmin() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/customers/me/tickets"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "cust", roles = {"CUSTOMER"})
    void shouldGetTicketById_WhenAuthenticated() throws Exception {
        // Arrange
        Ticket ticket = Ticket.builder().id(10L).ticketCode("GOS-123").build();
        when(ticketService.getById(10L)).thenReturn(ticket);

        // Act & Assert
        mockMvc.perform(get("/api/v1/tickets/10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.ticketCode").value("GOS-123"));
    }

    @Test
    void shouldReturn403_WhenGetTicketByIdAnonymous() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/tickets/10"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "cust", roles = {"CUSTOMER"})
    void shouldGetQRCode_WhenAuthenticated() throws Exception {
        // Arrange
        byte[] fakeQr = new byte[]{1, 2, 3, 4};
        when(ticketService.getQRCodeImage(10L)).thenReturn(fakeQr);

        // Act & Assert
        mockMvc.perform(get("/api/v1/tickets/10/qr"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(content().bytes(fakeQr));
    }
}
