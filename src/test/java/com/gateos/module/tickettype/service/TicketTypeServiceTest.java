package com.gateos.module.tickettype.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.tickettype.dto.TicketTypeRequest;
import com.gateos.module.tickettype.entity.TicketType;
import com.gateos.module.tickettype.repository.TicketTypeRepository;
import com.gateos.module.venue.repository.VenueRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketTypeServiceTest {

    @Mock
    private TicketTypeRepository ticketTypeRepository;

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private TicketTypeService ticketTypeService;

    @Test
    void shouldGetAllByVenueId_WhenVenueIdProvided() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<TicketType> page = new PageImpl<>(List.of(new TicketType()));
        when(ticketTypeRepository.findByVenueId(1L, pageable)).thenReturn(page);

        // Act
        Page<TicketType> result = ticketTypeService.getAll(1L, null, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(ticketTypeRepository).findByVenueId(1L, pageable);
    }

    @Test
    void shouldGetAllByStatus_WhenStatusValid() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<TicketType> page = new PageImpl<>(List.of(new TicketType()));
        when(ticketTypeRepository.findByStatus(TicketType.TicketTypeStatus.ACTIVE, pageable)).thenReturn(page);

        // Act
        Page<TicketType> result = ticketTypeService.getAll(null, "ACTIVE", pageable);

        // Assert
        assertNotNull(result);
        verify(ticketTypeRepository).findByStatus(TicketType.TicketTypeStatus.ACTIVE, pageable);
    }

    @Test
    void shouldGetAll_WhenStatusInvalid() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<TicketType> page = new PageImpl<>(List.of(new TicketType()));
        when(ticketTypeRepository.findAll(pageable)).thenReturn(page);

        // Act
        Page<TicketType> result = ticketTypeService.getAll(null, "INVALID_STATUS", pageable);

        // Assert
        assertNotNull(result);
        verify(ticketTypeRepository).findAll(pageable);
    }

    @Test
    void shouldGetAll_WhenNoFilters() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<TicketType> page = new PageImpl<>(List.of(new TicketType()));
        when(ticketTypeRepository.findAll(pageable)).thenReturn(page);

        // Act
        Page<TicketType> result = ticketTypeService.getAll(null, null, pageable);

        // Assert
        assertNotNull(result);
        verify(ticketTypeRepository).findAll(pageable);
    }

    @Test
    void shouldGetById_WhenExists() {
        // Arrange
        TicketType ticketType = TicketType.builder().id(5L).name("Adult Ticket").build();
        when(ticketTypeRepository.findById(5L)).thenReturn(Optional.of(ticketType));

        // Act
        TicketType result = ticketTypeService.getById(5L);

        // Assert
        assertNotNull(result);
        assertEquals("Adult Ticket", result.getName());
    }

    @Test
    void shouldThrowNotFound_WhenGetByIdDoesNotExist() {
        // Arrange
        when(ticketTypeRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> ticketTypeService.getById(99L));
        assertEquals("ERR-TKT-003", ex.getErrorCode());
    }

    @Test
    void shouldCreateTicketType_WhenRequestValid() {
        // Arrange
        TicketTypeRequest request = new TicketTypeRequest();
        request.setVenueId(1L);
        request.setName("Child Ticket");
        request.setType(TicketType.TicketCategory.ENTRY);
        request.setPrice(BigDecimal.valueOf(50000));
        request.setStatus(TicketType.TicketTypeStatus.ACTIVE);
        request.setPolicy("No refund");
        request.setValidDays(2);

        when(venueRepository.existsById(1L)).thenReturn(true);
        when(ticketTypeRepository.save(any(TicketType.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        TicketType result = ticketTypeService.create(request);

        // Assert
        assertNotNull(result);
        assertEquals("Child Ticket", result.getName());
        assertEquals(2, result.getValidDays());
        verify(ticketTypeRepository).save(any(TicketType.class));
    }

    @Test
    void shouldThrowNotFound_WhenCreateAndVenueDoesNotExist() {
        // Arrange
        TicketTypeRequest request = new TicketTypeRequest();
        request.setVenueId(99L);
        when(venueRepository.existsById(99L)).thenReturn(false);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> ticketTypeService.create(request));
        assertEquals("ERR-VEN-003", ex.getErrorCode());
    }

    @Test
    void shouldCreateWithDefaults_WhenStatusAndValidDaysNull() {
        // Arrange
        TicketTypeRequest request = new TicketTypeRequest();
        request.setVenueId(1L);
        request.setName("Default Ticket");
        request.setType(TicketType.TicketCategory.ENTRY);
        request.setPrice(BigDecimal.valueOf(100000));
        request.setStatus(null);
        request.setValidDays(null);

        when(venueRepository.existsById(1L)).thenReturn(true);
        when(ticketTypeRepository.save(any(TicketType.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        TicketType result = ticketTypeService.create(request);

        // Assert
        assertNotNull(result);
        assertEquals(TicketType.TicketTypeStatus.ACTIVE, result.getStatus());
        assertEquals(1, result.getValidDays());
    }

    @Test
    void shouldUpdateTicketType_WhenRequestValid() {
        // Arrange
        TicketType tt = TicketType.builder()
                .id(5L)
                .venueId(1L)
                .name("Old Name")
                .type(TicketType.TicketCategory.ENTRY)
                .price(BigDecimal.valueOf(40000))
                .status(TicketType.TicketTypeStatus.ACTIVE)
                .build();
        when(ticketTypeRepository.findById(5L)).thenReturn(Optional.of(tt));

        TicketTypeRequest request = new TicketTypeRequest();
        request.setName("New Name");
        request.setType(TicketType.TicketCategory.FULL_GAME);
        request.setPrice(BigDecimal.valueOf(120000));
        request.setPolicy("Refund allowed");
        request.setValidDays(5);
        request.setStatus(TicketType.TicketTypeStatus.INACTIVE);

        when(ticketTypeRepository.save(any(TicketType.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        TicketType result = ticketTypeService.update(5L, request);

        // Assert
        assertNotNull(result);
        assertEquals("New Name", result.getName());
        assertEquals(TicketType.TicketCategory.FULL_GAME, result.getType());
        assertEquals(BigDecimal.valueOf(120000), result.getPrice());
        assertEquals("Refund allowed", result.getPolicy());
        assertEquals(5, result.getValidDays());
        assertEquals(TicketType.TicketTypeStatus.INACTIVE, result.getStatus());
    }

    @Test
    void shouldSoftDeleteTicketType_WhenExists() {
        // Arrange
        TicketType tt = TicketType.builder().id(5L).status(TicketType.TicketTypeStatus.ACTIVE).build();
        when(ticketTypeRepository.findById(5L)).thenReturn(Optional.of(tt));

        // Act
        ticketTypeService.softDelete(5L);

        // Assert
        assertEquals(TicketType.TicketTypeStatus.INACTIVE, tt.getStatus());
        verify(ticketTypeRepository).save(tt);
    }
}
