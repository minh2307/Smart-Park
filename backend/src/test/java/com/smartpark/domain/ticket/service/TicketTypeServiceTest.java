package com.smartpark.domain.ticket.service;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.repository.ParkRepository;
import com.smartpark.domain.ticket.dto.TicketTypeRequestDto;
import com.smartpark.domain.ticket.dto.TicketTypeResponseDto;
import com.smartpark.domain.ticket.entity.TicketType;
import com.smartpark.domain.ticket.entity.TicketType.TicketCategory;
import com.smartpark.domain.ticket.entity.TicketType.TicketTypeStatus;
import com.smartpark.domain.ticket.repository.TicketTypeRepository;
import com.smartpark.domain.ticket.service.impl.TicketTypeServiceImpl;
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

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketTypeServiceTest {

    @Mock
    private TicketTypeRepository ticketTypeRepository;

    @Mock
    private ParkRepository parkRepository;

    @InjectMocks
    private TicketTypeServiceImpl ticketTypeService;

    private Park mockPark;
    private TicketType mockTicketType;
    private TicketTypeRequestDto mockRequest;

    @BeforeEach
    void setup() {
        mockPark = Park.builder()
                .id(1L)
                .name("Smart Park District 1")
                .code("SP01")
                .status(Park.ParkStatus.ACTIVE)
                .build();

        mockTicketType = TicketType.builder()
                .id(1L)
                .park(mockPark)
                .name("Adult Standard Ticket")
                .description("Standard daily entry for adults")
                .standardPrice(new BigDecimal("150000"))
                .minPrice(new BigDecimal("100000"))
                .maxPrice(new BigDecimal("200000"))
                .totalQuantity(100)
                .availableQuantity(100)
                .type(TicketCategory.ADULT)
                .status(TicketTypeStatus.ACTIVE)
                .build();

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
    }

    @Test
    void testCreateTicketType_Success() {
        when(parkRepository.findById(1L)).thenReturn(Optional.of(mockPark));
        when(ticketTypeRepository.save(any(TicketType.class))).thenReturn(mockTicketType);

        TicketTypeResponseDto response = ticketTypeService.createTicketType(mockRequest);

        assertNotNull(response);
        assertEquals(mockTicketType.getId(), response.getId());
        assertEquals(mockTicketType.getName(), response.getName());
        verify(ticketTypeRepository, times(1)).save(any(TicketType.class));
    }

    @Test
    void testCreateTicketType_ParkNotFound() {
        when(parkRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            ticketTypeService.createTicketType(mockRequest);
        });
        verify(ticketTypeRepository, never()).save(any(TicketType.class));
    }

    @Test
    void testUpdateTicketType_Success() {
        when(ticketTypeRepository.findById(1L)).thenReturn(Optional.of(mockTicketType));
        when(parkRepository.findById(1L)).thenReturn(Optional.of(mockPark));
        when(ticketTypeRepository.save(any(TicketType.class))).thenReturn(mockTicketType);

        mockRequest.setName("Adult VIP Ticket");
        TicketTypeResponseDto response = ticketTypeService.updateTicketType(1L, mockRequest);

        assertNotNull(response);
        assertEquals("Adult VIP Ticket", response.getName());
        verify(ticketTypeRepository, times(1)).save(mockTicketType);
    }

    @Test
    void testUpdateTicketType_NotFound() {
        when(ticketTypeRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            ticketTypeService.updateTicketType(1L, mockRequest);
        });
        verify(ticketTypeRepository, never()).save(any(TicketType.class));
    }

    @Test
    void testDeleteTicketType_Success() {
        when(ticketTypeRepository.findById(1L)).thenReturn(Optional.of(mockTicketType));
        when(ticketTypeRepository.save(any(TicketType.class))).thenReturn(mockTicketType);

        ticketTypeService.deleteTicketType(1L);

        assertEquals(TicketTypeStatus.INACTIVE, mockTicketType.getStatus());
        verify(ticketTypeRepository, times(1)).save(mockTicketType);
    }

    @Test
    void testGetTicketTypeById_Success() {
        when(ticketTypeRepository.findById(1L)).thenReturn(Optional.of(mockTicketType));

        TicketTypeResponseDto response = ticketTypeService.getTicketTypeById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void testGetAllTicketTypes_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<TicketType> page = new PageImpl<>(Collections.singletonList(mockTicketType));
        when(ticketTypeRepository.findAllWithFilters("Adult", TicketTypeStatus.ACTIVE, pageable)).thenReturn(page);

        Page<TicketTypeResponseDto> response = ticketTypeService.getAllTicketTypes("Adult", "ACTIVE", pageable);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals("Adult Standard Ticket", response.getContent().get(0).getName());
    }

    @Test
    void testGetTicketTypesByVenue_Success() {
        when(ticketTypeRepository.findByParkId(1L)).thenReturn(Collections.singletonList(mockTicketType));

        List<TicketTypeResponseDto> response = ticketTypeService.getTicketTypesByVenue(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("Adult Standard Ticket", response.get(0).getName());
    }
}
