package com.smartpark.domain.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.booking.dto.BookingRequest;
import com.smartpark.domain.booking.entity.Booking;
import com.smartpark.domain.booking.service.BookingService;
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

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

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
    void testCreateBooking() throws Exception {
        BookingRequest request = new BookingRequest();
        request.setCustomerId(1L);
        request.setValidDate(LocalDate.now());
        BookingRequest.TicketRequest tr = new BookingRequest.TicketRequest();
        tr.setTicketTypeId(1L);
        tr.setQuantity(2);
        request.setTickets(List.of(tr));

        Booking booking = Booking.builder()
                .id(10L)
                .bookingCode("BK-123")
                .status(Booking.BookingStatus.PENDING)
                .build();

        when(bookingService.createBooking(any(BookingRequest.class), any())).thenReturn(booking);

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(10L))
                .andExpect(jsonPath("$.data.bookingCode").value("BK-123"));
    }

    @Test
    @WithMockUser
    void testGetBooking() throws Exception {
        Booking booking = Booking.builder()
                .id(10L)
                .bookingCode("BK-123")
                .status(Booking.BookingStatus.PENDING)
                .build();

        when(bookingService.findByCode("BK-123")).thenReturn(booking);

        mockMvc.perform(get("/api/v1/bookings/code/BK-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingCode").value("BK-123"));
    }

    @Test
    @WithMockUser
    void testFindAll() throws Exception {
        when(bookingService.findAll(any())).thenReturn(org.springframework.data.domain.Page.empty());
        mockMvc.perform(get("/api/v1/bookings"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void testFindByCustomer() throws Exception {
        when(bookingService.findByCustomer(eq(1L), any())).thenReturn(org.springframework.data.domain.Page.empty());
        mockMvc.perform(get("/api/v1/bookings/history/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void testFindById() throws Exception {
        Booking booking = Booking.builder().id(10L).build();
        when(bookingService.findById(10L)).thenReturn(booking);
        mockMvc.perform(get("/api/v1/bookings/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(10));
    }

    @Test
    @WithMockUser
    void testConfirmPayment() throws Exception {
        Booking booking = Booking.builder().bookingCode("BK-123").status(Booking.BookingStatus.PAID).build();
        when(bookingService.confirmPayment("BK-123")).thenReturn(booking);
        mockMvc.perform(post("/api/v1/bookings/BK-123/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAID"));
    }

    @Test
    @WithMockUser
    void testCancelBooking() throws Exception {
        Booking booking = Booking.builder().bookingCode("BK-123").status(Booking.BookingStatus.CANCELLED).build();
        when(bookingService.cancel(eq("BK-123"), any())).thenReturn(booking);
        mockMvc.perform(put("/api/v1/bookings/BK-123/cancel").param("reason", "changed mind"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    @WithMockUser
    void testUpdateStatus() throws Exception {
        Booking booking = Booking.builder().id(10L).status(Booking.BookingStatus.COMPLETED).build();
        when(bookingService.updateStatus(eq(10L), eq(Booking.BookingStatus.COMPLETED))).thenReturn(booking);
        mockMvc.perform(patch("/api/v1/bookings/10/status").param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }
}
