package com.gateos.module.attraction.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.attraction.dto.AttractionRequest;
import com.gateos.module.attraction.entity.Attraction;
import com.gateos.module.attraction.repository.AttractionRepository;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttractionServiceTest {

    @Mock
    private AttractionRepository attractionRepository;

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private AttractionService attractionService;

    @Test
    void shouldGetByVenue_WhenVenueExists() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(venueRepository.existsById(1L)).thenReturn(true);
        Page<Attraction> page = new PageImpl<>(List.of(new Attraction()));
        when(attractionRepository.findByVenueId(1L, pageable)).thenReturn(page);

        // Act
        Page<Attraction> result = attractionService.getByVenue(1L, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(venueRepository).existsById(1L);
        verify(attractionRepository).findByVenueId(1L, pageable);
    }

    @Test
    void shouldThrowNotFound_WhenGetByVenueAndVenueDoesNotExist() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(venueRepository.existsById(99L)).thenReturn(false);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> attractionService.getByVenue(99L, pageable));
        assertEquals("ERR-VEN-003", ex.getErrorCode());
        assertEquals("Địa điểm không tồn tại", ex.getMessage());
    }

    @Test
    void shouldGetById_WhenExists() {
        // Arrange
        Attraction attraction = Attraction.builder().id(10L).name("Roller Coaster").build();
        when(attractionRepository.findById(10L)).thenReturn(Optional.of(attraction));

        // Act
        Attraction result = attractionService.getById(10L);

        // Assert
        assertNotNull(result);
        assertEquals("Roller Coaster", result.getName());
    }

    @Test
    void shouldThrowNotFound_WhenGetByIdDoesNotExist() {
        // Arrange
        when(attractionRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> attractionService.getById(99L));
        assertEquals("ERR-ATT-003", ex.getErrorCode());
    }

    @Test
    void shouldCreateAttraction_WhenRequestValid() {
        // Arrange
        AttractionRequest request = new AttractionRequest();
        request.setVenueId(1L);
        request.setName("Ferris Wheel");
        request.setCapacity(50);
        request.setDescription("Giant wheel");
        request.setStatus(Attraction.AttractionStatus.ACTIVE);

        when(venueRepository.existsById(1L)).thenReturn(true);
        when(attractionRepository.existsByNameAndVenueId("Ferris Wheel", 1L)).thenReturn(false);
        when(attractionRepository.save(any(Attraction.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Attraction result = attractionService.create(request);

        // Assert
        assertNotNull(result);
        assertEquals("Ferris Wheel", result.getName());
        assertEquals(50, result.getCapacity());
        verify(attractionRepository).save(any(Attraction.class));
    }

    @Test
    void shouldThrowNotFound_WhenCreateAndVenueDoesNotExist() {
        // Arrange
        AttractionRequest request = new AttractionRequest();
        request.setVenueId(99L);
        when(venueRepository.existsById(99L)).thenReturn(false);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> attractionService.create(request));
        assertEquals("ERR-VEN-003", ex.getErrorCode());
    }

    @Test
    void shouldThrowConflict_WhenCreateAndNameDuplicateInVenue() {
        // Arrange
        AttractionRequest request = new AttractionRequest();
        request.setVenueId(1L);
        request.setName("Ferris Wheel");
        when(venueRepository.existsById(1L)).thenReturn(true);
        when(attractionRepository.existsByNameAndVenueId("Ferris Wheel", 1L)).thenReturn(true);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> attractionService.create(request));
        assertEquals("ERR-ATT-002", ex.getErrorCode());
    }

    @Test
    void shouldCreateWithDefaultStatusActive_WhenStatusNotProvided() {
        // Arrange
        AttractionRequest request = new AttractionRequest();
        request.setVenueId(1L);
        request.setName("Ferris Wheel");
        request.setStatus(null);

        when(venueRepository.existsById(1L)).thenReturn(true);
        when(attractionRepository.existsByNameAndVenueId("Ferris Wheel", 1L)).thenReturn(false);
        when(attractionRepository.save(any(Attraction.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Attraction result = attractionService.create(request);

        // Assert
        assertNotNull(result);
        assertEquals(Attraction.AttractionStatus.ACTIVE, result.getStatus());
    }

    @Test
    void shouldUpdateAttraction_WhenRequestValid() {
        // Arrange
        Attraction attraction = Attraction.builder().id(10L).venueId(1L).name("Ferris Wheel").build();
        when(attractionRepository.findById(10L)).thenReturn(Optional.of(attraction));

        AttractionRequest request = new AttractionRequest();
        request.setName("Ferris Wheel Updated");
        request.setCapacity(60);
        request.setDescription("New Desc");
        request.setStatus(Attraction.AttractionStatus.INACTIVE);

        when(attractionRepository.existsByNameAndVenueIdAndIdNot("Ferris Wheel Updated", 1L, 10L)).thenReturn(false);
        when(attractionRepository.save(any(Attraction.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Attraction result = attractionService.update(10L, request);

        // Assert
        assertNotNull(result);
        assertEquals("Ferris Wheel Updated", result.getName());
        assertEquals(60, result.getCapacity());
        assertEquals(Attraction.AttractionStatus.INACTIVE, result.getStatus());
    }

    @Test
    void shouldThrowConflict_WhenUpdateAndNameDuplicateInVenue() {
        // Arrange
        Attraction attraction = Attraction.builder().id(10L).venueId(1L).name("Ferris Wheel").build();
        when(attractionRepository.findById(10L)).thenReturn(Optional.of(attraction));

        AttractionRequest request = new AttractionRequest();
        request.setName("Duplicate Name");

        when(attractionRepository.existsByNameAndVenueIdAndIdNot("Duplicate Name", 1L, 10L)).thenReturn(true);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> attractionService.update(10L, request));
        assertEquals("ERR-ATT-002", ex.getErrorCode());
    }

    @Test
    void shouldSoftDeleteAttraction_WhenExists() {
        // Arrange
        Attraction attraction = Attraction.builder().id(10L).venueId(1L).name("Ferris Wheel").status(Attraction.AttractionStatus.ACTIVE).build();
        when(attractionRepository.findById(10L)).thenReturn(Optional.of(attraction));

        // Act
        attractionService.softDelete(10L);

        // Assert
        assertEquals(Attraction.AttractionStatus.INACTIVE, attraction.getStatus());
        verify(attractionRepository).save(attraction);
    }
}
