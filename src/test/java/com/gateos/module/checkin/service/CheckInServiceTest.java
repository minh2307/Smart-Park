package com.gateos.module.checkin.service;

import com.gateos.module.checkin.entity.CheckIn;
import com.gateos.module.checkin.repository.CheckInRepository;
import com.gateos.module.ticket.entity.Ticket;
import com.gateos.module.ticket.repository.TicketRepository;
import com.gateos.module.ticket.service.TicketService;
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
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckInServiceTest {

    @Mock
    private CheckInRepository checkInRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketService ticketService;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private CheckInService checkInService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(checkInService, "cooldownTtlSeconds", 10L);
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void shouldReturnDuplicateScan_WhenCooldownActive() {
        // Arrange
        when(redisTemplate.hasKey("checkin:cooldown:GOS-EN-123")).thenReturn(true);

        // Act
        Map<String, Object> result = checkInService.scan("GOS-EN-123", 10L, 20L);

        // Assert
        assertNotNull(result);
        assertEquals(false, result.get("success"));
        assertEquals("DUPLICATE_SCAN", result.get("code"));
        verifyNoInteractions(ticketService, ticketRepository);
    }

    @Test
    void shouldReturnNotFound_WhenTicketDoesNotExist() {
        // Arrange
        when(redisTemplate.hasKey("checkin:cooldown:GOS-EN-123")).thenReturn(false);
        when(ticketService.getFromCache("GOS-EN-123")).thenReturn(null);
        when(ticketRepository.findByTicketCode("GOS-EN-123")).thenReturn(Optional.empty());

        // Act
        Map<String, Object> result = checkInService.scan("GOS-EN-123", 10L, 20L);

        // Assert
        assertNotNull(result);
        assertEquals(false, result.get("success"));
        assertEquals("NOT_FOUND", result.get("code"));
        verify(checkInRepository).save(any(CheckIn.class));
    }

    @Test
    void shouldReturnAlreadyUsed_WhenTicketStatusUsed() {
        // Arrange
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("GOS-EN-123")
                .status(Ticket.TicketStatus.USED)
                .build();
        setupScanMocks(ticket);

        // Act
        Map<String, Object> result = checkInService.scan("GOS-EN-123", 10L, 20L);

        // Assert
        assertNotNull(result);
        assertEquals(false, result.get("success"));
        assertEquals("ALREADY_USED", result.get("code"));
        verify(checkInRepository).save(any(CheckIn.class));
    }

    @Test
    void shouldReturnExpired_WhenTicketStatusExpired() {
        // Arrange
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("GOS-EN-123")
                .status(Ticket.TicketStatus.EXPIRED)
                .build();
        setupScanMocks(ticket);

        // Act
        Map<String, Object> result = checkInService.scan("GOS-EN-123", 10L, 20L);

        // Assert
        assertNotNull(result);
        assertEquals(false, result.get("success"));
        assertEquals("EXPIRED", result.get("code"));
    }

    @Test
    void shouldReturnRefunded_WhenTicketStatusRefunded() {
        // Arrange
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("GOS-EN-123")
                .status(Ticket.TicketStatus.REFUNDED)
                .build();
        setupScanMocks(ticket);

        // Act
        Map<String, Object> result = checkInService.scan("GOS-EN-123", 10L, 20L);

        // Assert
        assertNotNull(result);
        assertEquals(false, result.get("success"));
        assertEquals("REFUNDED", result.get("code"));
    }

    @Test
    void shouldReturnExpired_WhenValidToDateIsBeforeToday() {
        // Arrange
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("GOS-EN-123")
                .status(Ticket.TicketStatus.UNUSED)
                .validFrom(LocalDate.now().minusDays(5))
                .validTo(LocalDate.now().minusDays(1))
                .build();
        setupScanMocks(ticket);

        // Act
        Map<String, Object> result = checkInService.scan("GOS-EN-123", 10L, 20L);

        // Assert
        assertNotNull(result);
        assertEquals(false, result.get("success"));
        assertEquals("EXPIRED", result.get("code"));
    }

    @Test
    void shouldReturnNotYetValid_WhenValidFromDateIsAfterToday() {
        // Arrange
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("GOS-EN-123")
                .status(Ticket.TicketStatus.UNUSED)
                .validFrom(LocalDate.now().plusDays(1))
                .validTo(LocalDate.now().plusDays(5))
                .build();
        setupScanMocks(ticket);

        // Act
        Map<String, Object> result = checkInService.scan("GOS-EN-123", 10L, 20L);

        // Assert
        assertNotNull(result);
        assertEquals(false, result.get("success"));
        assertEquals("NOT_YET_VALID", result.get("code"));
    }

    @Test
    void shouldReturnSuccess_WhenTicketIsValid() {
        // Arrange
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("GOS-EN-123")
                .status(Ticket.TicketStatus.UNUSED)
                .validFrom(LocalDate.now().minusDays(1))
                .validTo(LocalDate.now().plusDays(2))
                .build();
        setupScanMocks(ticket);

        // Act
        Map<String, Object> result = checkInService.scan("GOS-EN-123", 10L, 20L);

        // Assert
        assertNotNull(result);
        assertEquals(true, result.get("success"));
        assertEquals("SUCCESS", result.get("code"));
        assertEquals(true, result.get("openGate"));
        assertEquals(Ticket.TicketStatus.USED, ticket.getStatus());
        verify(ticketRepository).save(ticket);
        verify(redisTemplate).delete("ticket:GOS-EN-123");
        verify(checkInRepository).save(any(CheckIn.class));
    }

    @Test
    void shouldPerformManualOverride_WhenTicketExists() {
        // Arrange
        Ticket ticket = Ticket.builder().id(1L).ticketCode("GOS-EN-123").build();
        when(ticketRepository.findByTicketCode("GOS-EN-123")).thenReturn(Optional.of(ticket));

        // Act
        Map<String, Object> result = checkInService.manualOverride("GOS-EN-123", 10L, "VIP Guest");

        // Assert
        assertNotNull(result);
        assertEquals(true, result.get("success"));
        assertEquals("OVERRIDE", result.get("code"));
        verify(checkInRepository).save(any(CheckIn.class));
    }

    @Test
    void shouldPerformManualOverride_WhenTicketDoesNotExist() {
        // Arrange
        when(ticketRepository.findByTicketCode("GOS-EN-123")).thenReturn(Optional.empty());

        // Act
        Map<String, Object> result = checkInService.manualOverride("GOS-EN-123", 10L, "VIP Guest");

        // Assert
        assertNotNull(result);
        assertEquals(true, result.get("success"));
        verify(checkInRepository).save(any(CheckIn.class));
    }

    @Test
    void shouldGetHistory() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<CheckIn> page = new PageImpl<>(List.of(new CheckIn()));
        when(checkInRepository.findAll(pageable)).thenReturn(page);

        // Act
        Page<CheckIn> result = checkInService.getHistory(pageable);

        // Assert
        assertNotNull(result);
    }

    private void setupScanMocks(Ticket ticket) {
        when(redisTemplate.hasKey("checkin:cooldown:GOS-EN-123")).thenReturn(false);
        when(ticketService.getFromCache("GOS-EN-123")).thenReturn(ticket);
    }
}
