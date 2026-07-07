package com.gateos.module.ticket.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.order.entity.Order;
import com.gateos.module.order.entity.OrderItem;
import com.gateos.module.ticket.entity.Ticket;
import com.gateos.module.ticket.repository.TicketRepository;
import com.gateos.module.tickettype.entity.TicketType;
import com.gateos.module.tickettype.repository.TicketTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketTypeRepository ticketTypeRepository;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(ticketService, "ticketTtlSeconds", 3600L);
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void shouldGenerateTicketsForOrder_WhenOrderPaid() {
        // Arrange
        Order order = Order.builder().customerId(100L).orderCode("GOS-123").build();
        OrderItem item = OrderItem.builder().id(1L).ticketTypeId(5L).quantity(2).build();
        order.setItems(List.of(item));

        TicketType tt = TicketType.builder()
                .id(5L)
                .type(TicketType.TicketCategory.ENTRY)
                .validDays(3)
                .build();

        when(ticketTypeRepository.findById(5L)).thenReturn(Optional.of(tt));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> {
            Ticket t = i.getArgument(0);
            t.setId(99L);
            return t;
        });

        // Act
        List<Ticket> tickets = ticketService.generateTicketsForOrder(order);

        // Assert
        assertNotNull(tickets);
        assertEquals(2, tickets.size());
        assertEquals(99L, tickets.get(0).getId());
        assertEquals(LocalDate.now().plusDays(3), tickets.get(0).getValidTo());
        verify(ticketRepository, times(2)).save(any(Ticket.class));
        verify(valueOperations, times(2)).set(anyString(), any(Ticket.class), eq(3600L), eq(TimeUnit.SECONDS));
    }

    @Test
    void shouldGetMyTickets() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Ticket> page = new PageImpl<>(List.of(new Ticket()));
        when(ticketRepository.findByCustomerId(100L, pageable)).thenReturn(page);

        // Act
        Page<Ticket> result = ticketService.getMyTickets(100L, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldGetById_WhenExists() {
        // Arrange
        Ticket ticket = Ticket.builder().id(10L).ticketCode("GOS-EN-123").build();
        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));

        // Act
        Ticket result = ticketService.getById(10L);

        // Assert
        assertNotNull(result);
        assertEquals("GOS-EN-123", result.getTicketCode());
    }

    @Test
    void shouldThrowNotFound_WhenGetByIdDoesNotExist() {
        // Arrange
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> ticketService.getById(99L));
        assertEquals("ERR-TKT-005", ex.getErrorCode());
    }

    @Test
    void shouldGetQRCodeImage() {
        // Arrange
        Ticket ticket = Ticket.builder().id(10L).ticketCode("GOS-EN-12345678").build();
        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));

        // Act
        byte[] qrBytes = ticketService.getQRCodeImage(10L);

        // Assert
        assertNotNull(qrBytes);
        assertTrue(qrBytes.length > 0);
    }

    @Test
    void shouldGetFromCache_WhenCacheHits() {
        // Arrange
        Ticket cachedTicket = Ticket.builder().ticketCode("GOS-EN-123").build();
        when(valueOperations.get("ticket:GOS-EN-123")).thenReturn(cachedTicket);

        // Act
        Ticket result = ticketService.getFromCache("GOS-EN-123");

        // Assert
        assertNotNull(result);
        assertEquals("GOS-EN-123", result.getTicketCode());
        verifyNoInteractions(ticketRepository);
    }

    @Test
    void shouldGetFromCache_WhenCacheMissesAndDBHits() {
        // Arrange
        when(valueOperations.get("ticket:GOS-EN-123")).thenReturn(null);
        Ticket dbTicket = Ticket.builder().ticketCode("GOS-EN-123").build();
        when(ticketRepository.findByTicketCode("GOS-EN-123")).thenReturn(Optional.of(dbTicket));

        // Act
        Ticket result = ticketService.getFromCache("GOS-EN-123");

        // Assert
        assertNotNull(result);
        assertEquals("GOS-EN-123", result.getTicketCode());
        verify(ticketRepository).findByTicketCode("GOS-EN-123");
    }

    @Test
    void shouldGetFromCache_WhenCacheMissesAndDBMisses() {
        // Arrange
        when(valueOperations.get("ticket:GOS-EN-123")).thenReturn(null);
        when(ticketRepository.findByTicketCode("GOS-EN-123")).thenReturn(Optional.empty());

        // Act
        Ticket result = ticketService.getFromCache("GOS-EN-123");

        // Assert
        nullCheck(result);
    }

    private void nullCheck(Ticket result) {
        assertNull(result);
    }
}
