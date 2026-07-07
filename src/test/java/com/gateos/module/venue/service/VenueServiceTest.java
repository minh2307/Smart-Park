package com.gateos.module.venue.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.venue.dto.VenueRequest;
import com.gateos.module.venue.entity.Venue;
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
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private VenueService venueService;

    @Test
    void shouldGetAll_WhenStatusValid() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Venue> expectedPage = new PageImpl<>(List.of(new Venue()));
        when(venueRepository.findAllWithFilter("Park", Venue.VenueStatus.ACTIVE, pageable)).thenReturn(expectedPage);

        // Act
        Page<Venue> result = venueService.getAll("Park", "ACTIVE", pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(venueRepository).findAllWithFilter("Park", Venue.VenueStatus.ACTIVE, pageable);
    }

    @Test
    void shouldGetAll_WhenStatusInvalid() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Venue> expectedPage = new PageImpl<>(List.of(new Venue()));
        when(venueRepository.findAllWithFilter("Park", null, pageable)).thenReturn(expectedPage);

        // Act
        Page<Venue> result = venueService.getAll("Park", "INVALID_STATUS", pageable);

        // Assert
        assertNotNull(result);
        verify(venueRepository).findAllWithFilter("Park", null, pageable);
    }

    @Test
    void shouldGetAll_WhenStatusIsNull() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Venue> expectedPage = new PageImpl<>(List.of(new Venue()));
        when(venueRepository.findAllWithFilter("Park", null, pageable)).thenReturn(expectedPage);

        // Act
        Page<Venue> result = venueService.getAll("Park", null, pageable);

        // Assert
        assertNotNull(result);
        verify(venueRepository).findAllWithFilter("Park", null, pageable);
    }

    @Test
    void shouldGetById_WhenExists() {
        // Arrange
        Venue venue = Venue.builder().id(1L).name("Dam Sen").build();
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        // Act
        Venue result = venueService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("Dam Sen", result.getName());
    }

    @Test
    void shouldThrowNotFound_WhenGetByIdDoesNotExist() {
        // Arrange
        when(venueRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> venueService.getById(99L));
        assertEquals("ERR-VEN-003", ex.getErrorCode());
        assertEquals("Địa điểm không tồn tại", ex.getMessage());
    }

    @Test
    void shouldCreateVenue_WhenRequestValid() {
        // Arrange
        VenueRequest request = new VenueRequest();
        request.setName("Suoi Tien");
        request.setAddress("District 9, HCMC");
        request.setDescription("Water park");
        request.setStatus(Venue.VenueStatus.ACTIVE);

        when(venueRepository.existsByName("Suoi Tien")).thenReturn(false);
        Venue savedVenue = Venue.builder()
                .id(2L)
                .name("Suoi Tien")
                .address("District 9, HCMC")
                .description("Water park")
                .status(Venue.VenueStatus.ACTIVE)
                .build();
        when(venueRepository.save(any(Venue.class))).thenReturn(savedVenue);

        // Act
        Venue result = venueService.create(request);

        // Assert
        assertNotNull(result);
        assertEquals(2L, result.getId());
        verify(venueRepository).save(any(Venue.class));
    }

    @Test
    void shouldCreateVenueWithDefaultStatus_WhenStatusNotProvided() {
        // Arrange
        VenueRequest request = new VenueRequest();
        request.setName("Suoi Tien");
        request.setAddress("District 9");
        request.setStatus(null);

        when(venueRepository.existsByName("Suoi Tien")).thenReturn(false);
        when(venueRepository.save(any(Venue.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Venue result = venueService.create(request);

        // Assert
        assertNotNull(result);
        assertEquals(Venue.VenueStatus.ACTIVE, result.getStatus());
    }

    @Test
    void shouldThrowConflict_WhenCreatingDuplicateVenueName() {
        // Arrange
        VenueRequest request = new VenueRequest();
        request.setName("Existing Venue");
        when(venueRepository.existsByName("Existing Venue")).thenReturn(true);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> venueService.create(request));
        assertEquals("ERR-VEN-001", ex.getErrorCode());
    }

    @Test
    void shouldUpdateVenue_WhenRequestValid() {
        // Arrange
        VenueExistingCheckMock();
        VenueRequest request = new VenueRequest();
        request.setName("Suoi Tien Updated");
        request.setAddress("New Address");
        request.setDescription("New Desc");
        request.setStatus(Venue.VenueStatus.INACTIVE);

        when(venueRepository.existsByNameAndIdNot("Suoi Tien Updated", 1L)).thenReturn(false);
        when(venueRepository.save(any(Venue.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Venue result = venueService.update(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals("Suoi Tien Updated", result.getName());
        assertEquals("New Address", result.getAddress());
        assertEquals(Venue.VenueStatus.INACTIVE, result.getStatus());
    }

    @Test
    void shouldThrowConflict_WhenUpdatingDuplicateVenueName() {
        // Arrange
        VenueExistingCheckMock();
        VenueRequest request = new VenueRequest();
        request.setName("Duplicate Name");

        when(venueRepository.existsByNameAndIdNot("Duplicate Name", 1L)).thenReturn(true);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> venueService.update(1L, request));
        assertEquals("ERR-VEN-001", ex.getErrorCode());
    }

    @Test
    void shouldSoftDeleteVenue_WhenExists() {
        // Arrange
        Venue venue = Venue.builder().id(1L).name("Venue to delete").status(Venue.VenueStatus.ACTIVE).build();
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        // Act
        venueService.softDelete(1L);

        // Assert
        assertEquals(Venue.VenueStatus.INACTIVE, venue.getStatus());
        verify(venueRepository).save(venue);
    }

    private void VenueExistingCheckMock() {
        Venue venue = Venue.builder().id(1L).name("Suoi Tien").address("Old Address").status(Venue.VenueStatus.ACTIVE).build();
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
    }
}
