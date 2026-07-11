package com.smartpark.domain.ticket.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.notification.repository.NotificationRepository;
import com.smartpark.domain.ticket.entity.CheckIn;
import com.smartpark.domain.ticket.entity.Ticket;
import com.smartpark.domain.ticket.entity.TicketType;
import com.smartpark.domain.ticket.repository.CheckInRepository;
import com.smartpark.domain.ticket.repository.TicketRepository;
import com.smartpark.domain.ticket.repository.TicketTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private TicketTypeRepository ticketTypeRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private CheckInRepository checkInRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private AnalyticsEventPublisher analyticsEventPublisher;

    @InjectMocks
    private TicketService ticketService;

    private Customer mockCustomer;
    private TicketType mockTicketType;

    @BeforeEach
    void setup() {
        mockCustomer = Customer.builder().id(1L).build();
        mockTicketType = TicketType.builder()
                .id(1L)
                .status(TicketType.TicketTypeStatus.ACTIVE)
                .availableQuantity(50)
                .build();
    }

    @Test
    void testReserveTickets_Success() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(ticketTypeRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(mockTicketType));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            t.setId(100L);
            return t;
        });

        List<Ticket> reserved = ticketService.reserveTickets(1L, 1L, 2, LocalDate.now());

        assertEquals(2, reserved.size());
        assertEquals(48, mockTicketType.getAvailableQuantity());
        verify(ticketTypeRepository, times(1)).save(mockTicketType);
        verify(ticketRepository, times(2)).save(any(Ticket.class));
    }

    @Test
    void testReserveTickets_OutOfStock() {
        mockTicketType.setAvailableQuantity(1);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(ticketTypeRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(mockTicketType));

        assertThrows(ConflictException.class, () -> {
            ticketService.reserveTickets(1L, 1L, 2, LocalDate.now());
        });
    }

    @Test
    void testReserveTickets_InvalidQuantity() {
        assertThrows(BusinessException.class, () -> {
            ticketService.reserveTickets(1L, 1L, 15, LocalDate.now()); // max is 10
        });
    }

    @Test
    void testCheckIn_Success() {
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("VALID-CODE")
                .status(Ticket.TicketStatus.PAID)
                .validDate(LocalDate.now())
                .customer(mockCustomer)
                .build();

        when(ticketRepository.findByTicketCodeForUpdate("VALID-CODE")).thenReturn(Optional.of(ticket));
        when(checkInRepository.save(any(CheckIn.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CheckIn checkIn = ticketService.checkIn("VALID-CODE");

        assertNotNull(checkIn);
        assertEquals(Ticket.TicketStatus.CHECKED_IN, ticket.getStatus());
        verify(ticketRepository).save(ticket);
    }

    @Test
    void testCheckIn_ExpiredTicket() {
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("EXPIRED-CODE")
                .status(Ticket.TicketStatus.PAID)
                .validDate(LocalDate.now().minusDays(1)) // expired yesterday
                .customer(mockCustomer)
                .build();

        when(ticketRepository.findByTicketCodeForUpdate("EXPIRED-CODE")).thenReturn(Optional.of(ticket));

        assertThrows(BusinessException.class, () -> {
            ticketService.checkIn("EXPIRED-CODE");
        });
        assertEquals(Ticket.TicketStatus.EXPIRED, ticket.getStatus());
    }

    @Test
    void testCheckIn_AlreadyCheckedIn() {
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("USED-CODE")
                .status(Ticket.TicketStatus.CHECKED_IN)
                .validDate(LocalDate.now())
                .customer(mockCustomer)
                .build();

        when(ticketRepository.findByTicketCodeForUpdate("USED-CODE")).thenReturn(Optional.of(ticket));

        assertThrows(ConflictException.class, () -> {
            ticketService.checkIn("USED-CODE");
        });
    }
}
