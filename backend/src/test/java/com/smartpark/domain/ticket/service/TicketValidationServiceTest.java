package com.smartpark.domain.ticket.service;

import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.ride.entity.Ride;
import com.smartpark.domain.ride.repository.RideRepository;
import com.smartpark.domain.ticket.dto.ScanRequestDto;
import com.smartpark.domain.ticket.dto.ScanResponseDto;
import com.smartpark.domain.ticket.dto.ValidationLogDto;
import com.smartpark.domain.ticket.dto.ValidationSummaryStatsDto;
import com.smartpark.domain.ticket.entity.CheckIn;
import com.smartpark.domain.ticket.entity.Ticket;
import com.smartpark.domain.ticket.entity.Ticket.TicketStatus;
import com.smartpark.domain.ticket.entity.TicketType;
import com.smartpark.domain.ticket.entity.TicketValidationLog;
import com.smartpark.domain.ticket.repository.CheckInRepository;
import com.smartpark.domain.ticket.repository.TicketRepository;
import com.smartpark.domain.ticket.repository.TicketValidationLogRepository;
import com.smartpark.domain.ticket.service.impl.TicketValidationServiceImpl;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketValidationServiceTest {

    @Mock
    private TicketValidationLogRepository logRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private CheckInRepository checkInRepository;

    @Mock
    private RideRepository rideRepository;

    @InjectMocks
    private TicketValidationServiceImpl validationService;

    private Ride mockRide;
    private Ticket mockTicket;
    private Customer mockCustomer;
    private TicketType mockTicketType;

    @BeforeEach
    void setup() {
        mockRide = Ride.builder()
                .id(1L)
                .name("Super Coaster")
                .build();

        mockCustomer = Customer.builder()
                .id(1L)
                .fullName("John Doe")
                .build();

        mockTicketType = TicketType.builder()
                .id(1L)
                .type(TicketType.TicketCategory.ADULT)
                .build();

        mockTicket = Ticket.builder()
                .id(1L)
                .ticketCode("TK_DS_12345")
                .customer(mockCustomer)
                .ticketType(mockTicketType)
                .status(TicketStatus.PAID)
                .validDate(LocalDate.now().plusDays(2))
                .build();
    }

    @Test
    void testValidateScan_SimulatorExpired() {
        ScanRequestDto request = ScanRequestDto.builder()
                .qrCode("TK_EXPIRED_123")
                .gateId(1L)
                .build();

        when(logRepository.save(any(TicketValidationLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScanResponseDto response = validationService.validateScan(request);

        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertEquals("EXPIRED", response.getStatus());
        assertTrue(response.getLog().getFailureReason().contains("hết hạn"));
        verify(ticketRepository, never()).findByTicketCodeForUpdate(anyString());
    }

    @Test
    void testValidateScan_SimulatorWrongLocation() {
        ScanRequestDto request = ScanRequestDto.builder()
                .qrCode("TK_WRONG_LOC_456")
                .gateId(2L)
                .build();

        when(logRepository.save(any(TicketValidationLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScanResponseDto response = validationService.validateScan(request);

        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertEquals("WRONG_LOCATION", response.getStatus());
        verify(ticketRepository, never()).findByTicketCodeForUpdate(anyString());
    }

    @Test
    void testValidateScan_RealTicketSuccess() {
        ScanRequestDto request = ScanRequestDto.builder()
                .qrCode("TK_DS_12345")
                .gateId(1L)
                .attractionId(1L)
                .build();

        when(rideRepository.findById(1L)).thenReturn(Optional.of(mockRide));
        when(ticketRepository.findByTicketCodeForUpdate("TK_DS_12345")).thenReturn(Optional.of(mockTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(mockTicket);
        when(checkInRepository.save(any(CheckIn.class))).thenReturn(new CheckIn());
        when(logRepository.save(any(TicketValidationLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScanResponseDto response = validationService.validateScan(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(TicketStatus.CHECKED_IN, mockTicket.getStatus());
        assertEquals("John Doe", response.getLog().getCustomerName());
        assertEquals("Super Coaster", response.getLog().getAttractionName());

        verify(checkInRepository, times(1)).save(any(CheckIn.class));
        verify(ticketRepository, times(1)).save(mockTicket);
    }

    @Test
    void testValidateScan_TicketNotFound() {
        ScanRequestDto request = ScanRequestDto.builder()
                .qrCode("TK_DS_NOTFOUND")
                .build();

        when(ticketRepository.findByTicketCodeForUpdate("TK_DS_NOTFOUND")).thenReturn(Optional.empty());
        when(logRepository.save(any(TicketValidationLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScanResponseDto response = validationService.validateScan(request);

        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertEquals("INVALID_CODE", response.getStatus());
        assertTrue(response.getLog().getFailureReason().contains("không có trong hệ thống"));
    }

    @Test
    void testValidateScan_TicketAlreadyUsed() {
        ScanRequestDto request = ScanRequestDto.builder()
                .qrCode("TK_DS_12345")
                .build();

        mockTicket.setStatus(TicketStatus.USED);

        when(ticketRepository.findByTicketCodeForUpdate("TK_DS_12345")).thenReturn(Optional.of(mockTicket));
        when(logRepository.save(any(TicketValidationLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScanResponseDto response = validationService.validateScan(request);

        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertEquals("ALREADY_USED", response.getStatus());
    }

    @Test
    void testGetValidationLogs() {
        Pageable pageable = PageRequest.of(0, 10);
        TicketValidationLog entity = TicketValidationLog.builder()
                .id(1L)
                .ticketCode("TK_DS_123")
                .status("SUCCESS")
                .checkInTime(LocalDateTime.now())
                .build();
        Page<TicketValidationLog> page = new PageImpl<>(Collections.singletonList(entity));

        when(logRepository.findAllWithFilters("TK_DS", "SUCCESS", 1L, pageable)).thenReturn(page);

        Page<ValidationLogDto> result = validationService.getValidationLogs("TK_DS", "SUCCESS", 1L, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("TK_DS_123", result.getContent().get(0).getTicketCode());
    }

    @Test
    void testGetValidationStats() {
        when(logRepository.count()).thenReturn(10L);
        when(logRepository.countByStatus("SUCCESS")).thenReturn(7L);
        when(logRepository.countByStatus("WRONG_LOCATION")).thenReturn(1L);
        when(logRepository.countByStatus("EXPIRED")).thenReturn(1L);
        when(logRepository.countByStatus("ALREADY_USED")).thenReturn(1L);

        ValidationSummaryStatsDto stats = validationService.getValidationStats();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalScans());
        assertEquals(7L, stats.getSuccessfulScans());
        assertEquals(3L, stats.getFailedScans());
        assertEquals(1L, stats.getWrongLocationScans());
        assertEquals(1L, stats.getExpiredScans());
        assertEquals(1L, stats.getAlreadyUsedScans());
    }

    @Test
    void testClearValidationLogs() {
        validationService.clearValidationLogs();
        verify(logRepository, times(1)).deleteAllInBatch();
    }
}
