package com.smartpark.domain.booking.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.booking.dto.BookingRequest;
import com.smartpark.domain.booking.entity.Booking;
import com.smartpark.domain.booking.repository.BookingRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.membership.service.MembershipService;
import com.smartpark.domain.promotion.service.PromotionService;
import com.smartpark.domain.ticket.entity.Ticket;
import com.smartpark.domain.ticket.entity.TicketType;
import com.smartpark.domain.ticket.repository.TicketRepository;
import com.smartpark.domain.ticket.repository.TicketTypeRepository;
import com.smartpark.domain.ticket.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private TicketService ticketService;
    @Mock
    private TicketTypeRepository ticketTypeRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Mock
    private PromotionService promotionService;
    @Mock
    private MembershipService membershipService;

    @Mock
    private AnalyticsEventPublisher analyticsEventPublisher;

    @InjectMocks
    private BookingService bookingService;

    private Customer mockCustomer;
    private TicketType mockTicketType;

    @BeforeEach
    void setup() {
        mockCustomer = Customer.builder().id(1L).build();
        mockTicketType = TicketType.builder()
                .id(1L)
                .standardPrice(new BigDecimal("100000"))
                .build();
    }

    @Test
    void testCreateBooking_Success() {
        BookingRequest request = new BookingRequest();
        request.setCustomerId(1L);
        request.setValidDate(LocalDate.now());
        BookingRequest.TicketRequest tr = new BookingRequest.TicketRequest();
        tr.setTicketTypeId(1L);
        tr.setQuantity(2);
        request.setTickets(List.of(tr));

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(bookingRepository.countByCustomerIdAndStatus(1L, Booking.BookingStatus.PENDING)).thenReturn(0L);
        when(ticketTypeRepository.findById(1L)).thenReturn(Optional.of(mockTicketType));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            b.setId(10L);
            return b;
        });

        Ticket mockTicket = Ticket.builder().id(100L).build();
        when(ticketService.reserveTickets(eq(1L), eq(1L), eq(2), any())).thenReturn(List.of(mockTicket, mockTicket));

        Booking booking = bookingService.createBooking(request, null);

        assertNotNull(booking);
        assertEquals(Booking.BookingStatus.PENDING, booking.getStatus());
        assertEquals(new BigDecimal("200000"), booking.getTotalAmount());
        verify(ticketRepository).saveAll(any());
    }

    @Test
    void testCreateBooking_TooManyPending() {
        BookingRequest request = new BookingRequest();
        request.setCustomerId(1L);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(bookingRepository.countByCustomerIdAndStatus(1L, Booking.BookingStatus.PENDING)).thenReturn(3L);

        assertThrows(ConflictException.class, () -> {
            bookingService.createBooking(request, null);
        });
    }

    @Test
    void testConfirmPayment_Success() {
        Booking booking = Booking.builder()
                .id(1L)
                .bookingCode("BK-TEST")
                .status(Booking.BookingStatus.PENDING)
                .customer(mockCustomer)
                .totalAmount(new BigDecimal("100000"))
                .build();

        when(bookingRepository.findByBookingCode("BK-TEST")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        
        Ticket mockTicket = Ticket.builder().id(100L).build();
        when(ticketRepository.findByBookingId(1L)).thenReturn(List.of(mockTicket));

        Booking confirmed = bookingService.confirmPayment("BK-TEST");

        assertEquals(Booking.BookingStatus.PAID, confirmed.getStatus());
        assertEquals(Booking.PaymentStatus.PAID, confirmed.getPaymentStatus());
        verify(ticketService).confirmTickets(List.of(100L));
        verify(membershipService).addPointsAndCheckTier(1L, 1L, new BigDecimal("100000"));
    }

    @Test
    void testExpireOverdueBookings() {
        Booking booking = Booking.builder()
                .id(1L)
                .bookingCode("BK-EXPIRED")
                .status(Booking.BookingStatus.PENDING)
                .build();

        when(bookingRepository.findByStatusAndExpiresAtBefore(eq(Booking.BookingStatus.PENDING), any()))
                .thenReturn(List.of(booking));

        Ticket mockTicket = Ticket.builder().id(100L).build();
        when(ticketRepository.findByBookingId(1L)).thenReturn(List.of(mockTicket));

        bookingService.expireOverdueBookings();

        assertEquals(Booking.BookingStatus.EXPIRED, booking.getStatus());
        verify(bookingRepository).save(booking);
        verify(ticketService).releaseTickets(List.of(100L));
    }

    @Test
    void testCreateBooking_Duplicate() {
        // We can simulate duplicate booking by checking the Redis idempotency lock.
        BookingRequest request = new BookingRequest();
        request.setCustomerId(1L);
        request.setValidDate(LocalDate.now());

        // Simulate that the customer is currently creating a booking
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), eq("PROCESSING"), any(Duration.class))).thenReturn(false);

        assertThrows(ConflictException.class, () -> {
            bookingService.createBooking(request, "lock123");
        });
    }

    @Test
    void testCancelBooking_Completed_ThrowsException() {
        Booking booking = Booking.builder()
                .id(1L)
                .bookingCode("BK-COMPLETED")
                .status(Booking.BookingStatus.COMPLETED)
                .build();

        when(bookingRepository.findByBookingCode("BK-COMPLETED")).thenReturn(Optional.of(booking));

        assertThrows(ConflictException.class, () -> {
            bookingService.cancel("BK-COMPLETED", "Cancel request");
        });
    }

    @Test
    void testCancelBooking_Paid() {
        Booking booking = Booking.builder()
                .id(1L)
                .bookingCode("BK-PAID")
                .status(Booking.BookingStatus.PAID)
                .customer(mockCustomer)
                .build();

        when(bookingRepository.findByBookingCode("BK-PAID")).thenReturn(Optional.of(booking));

        Ticket mockTicket = Ticket.builder().id(100L).build();
        when(ticketRepository.findByBookingId(1L)).thenReturn(List.of(mockTicket));

        bookingService.cancel("BK-PAID", "Customer changed mind");

        assertEquals(Booking.BookingStatus.CANCELLED, booking.getStatus());
        verify(ticketService).releaseTickets(List.of(100L));
    }

    @Test
    void testInvalidStatusTransition() {
        Booking booking = Booking.builder()
                .id(1L)
                .bookingCode("BK-CANCELLED")
                .status(Booking.BookingStatus.CANCELLED)
                .build();

        when(bookingRepository.findByBookingCode("BK-CANCELLED")).thenReturn(Optional.of(booking));

        // Attempting to confirm payment for a cancelled booking should throw an exception
        assertThrows(BusinessException.class, () -> {
            bookingService.confirmPayment("BK-CANCELLED");
        });
    }

    @Test
    void testCreateBooking_TransactionRollback() {
        BookingRequest request = new BookingRequest();
        request.setCustomerId(1L);
        request.setValidDate(LocalDate.now());
        BookingRequest.TicketRequest tr = new BookingRequest.TicketRequest();
        tr.setTicketTypeId(1L);
        tr.setQuantity(2);
        request.setTickets(List.of(tr));

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(bookingRepository.countByCustomerIdAndStatus(1L, Booking.BookingStatus.PENDING)).thenReturn(0L);
        when(ticketTypeRepository.findById(1L)).thenReturn(Optional.of(mockTicketType));
        
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), eq("LOCK"), any(Duration.class))).thenReturn(true);

        when(bookingRepository.save(any(Booking.class))).thenThrow(new RuntimeException("DB Error"));

        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(request, "lock123");
        });
    }
}
