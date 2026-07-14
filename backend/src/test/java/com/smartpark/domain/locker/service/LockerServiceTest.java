package com.smartpark.domain.locker.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.locker.dto.LockerDashboardStatsDto;
import com.smartpark.domain.locker.dto.LockerRequestDto;
import com.smartpark.domain.locker.dto.LockerResponseDto;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.repository.LockerRepository;
import com.smartpark.domain.locker.repository.LockerTransactionRepository;
import com.smartpark.domain.locker.service.impl.LockerServiceImpl;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.park.repository.ZoneRepository;
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
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LockerServiceTest {

    @Mock
    private LockerRepository lockerRepository;

    @Mock
    private LockerTransactionRepository lockerTransactionRepository;

    @Mock
    private ZoneRepository zoneRepository;

    @InjectMocks
    private LockerServiceImpl lockerService;

    private Zone zone;
    private Locker locker;
    private LockerRequestDto requestDto;

    @BeforeEach
    void setUp() {
        zone = new Zone();
        zone.setId(1L);
        zone.setName("Water Park Zone");

        locker = Locker.builder()
                .id(1L)
                .zone(zone)
                .lockerCode("L-001")
                .lockerNumber("Locker 001")
                .type("STANDARD")
                .rentalPrice(BigDecimal.valueOf(10000))
                .size(Locker.LockerSize.MEDIUM)
                .status(Locker.LockerStatus.AVAILABLE)
                .location("Near entrance")
                .qrCode("qr-l-001")
                .currentAvailability(true)
                .build();

        requestDto = LockerRequestDto.builder()
                .zoneId(1L)
                .lockerCode("L-001")
                .lockerNumber("Locker 001")
                .type("STANDARD")
                .rentalPrice(BigDecimal.valueOf(10000))
                .size(Locker.LockerSize.MEDIUM)
                .location("Near entrance")
                .build();
    }

    @Test
    void findAllLockers_ShouldReturnPageOfLockers() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Locker> page = new PageImpl<>(List.of(locker));
        when(lockerRepository.findAll(pageable)).thenReturn(page);

        Page<Locker> result = lockerService.findAllLockers(pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getLockerCode()).isEqualTo("L-001");
    }

    @Test
    void createLocker_ShouldSaveLocker_WhenValid() {
        when(lockerRepository.findByLockerCode("L-001")).thenReturn(Optional.empty());
        when(lockerRepository.save(any(Locker.class))).thenReturn(locker);

        Locker result = lockerService.createLocker(locker);

        assertThat(result).isNotNull();
        assertThat(result.getLockerCode()).isEqualTo("L-001");
    }

    @Test
    void createLocker_ShouldThrowBusinessException_WhenLockerCodeExists() {
        when(lockerRepository.findByLockerCode("L-001")).thenReturn(Optional.of(locker));

        assertThatThrownBy(() -> lockerService.createLocker(locker))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("đã tồn tại");
    }

    @Test
    void findAllTransactions_ShouldReturnPageOfTransactions() {
        Pageable pageable = PageRequest.of(0, 10);
        LockerTransaction tx = new LockerTransaction();
        Page<LockerTransaction> page = new PageImpl<>(List.of(tx));
        when(lockerTransactionRepository.findAll(pageable)).thenReturn(page);

        Page<LockerTransaction> result = lockerService.findAllTransactions(pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void createTransaction_ShouldSaveAndReturn() {
        LockerTransaction tx = new LockerTransaction();
        when(lockerTransactionRepository.save(tx)).thenReturn(tx);

        LockerTransaction result = lockerService.createTransaction(tx);

        assertThat(result).isNotNull();
        verify(lockerTransactionRepository).save(tx);
    }

    @Test
    void findLockerById_ShouldReturnDto_WhenExists() {
        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));

        LockerResponseDto result = lockerService.findLockerById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getLockerCode()).isEqualTo("L-001");
    }

    @Test
    void findLockerById_ShouldThrowResourceNotFoundException_WhenNotExists() {
        when(lockerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lockerService.findLockerById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createLockerDto_ShouldCreateLocker_WhenValid() {
        when(lockerRepository.findByLockerCode("L-001")).thenReturn(Optional.empty());
        when(zoneRepository.findById(1L)).thenReturn(Optional.of(zone));
        when(lockerRepository.save(any(Locker.class))).thenReturn(locker);

        LockerResponseDto result = lockerService.createLockerDto(requestDto);

        assertThat(result).isNotNull();
        assertThat(result.getLockerCode()).isEqualTo("L-001");
    }

    @Test
    void createLockerDto_ShouldThrowBusinessException_WhenLockerCodeExists() {
        when(lockerRepository.findByLockerCode("L-001")).thenReturn(Optional.of(locker));

        assertThatThrownBy(() -> lockerService.createLockerDto(requestDto))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void createLockerDto_ShouldThrowResourceNotFoundException_WhenZoneNotFound() {
        when(lockerRepository.findByLockerCode("L-001")).thenReturn(Optional.empty());
        when(zoneRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lockerService.createLockerDto(requestDto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateLocker_ShouldUpdateAndReturnDto_WhenValid() {
        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));
        when(lockerRepository.findByLockerCode("L-001")).thenReturn(Optional.of(locker));
        when(zoneRepository.findById(1L)).thenReturn(Optional.of(zone));
        when(lockerRepository.save(any(Locker.class))).thenReturn(locker);

        LockerResponseDto result = lockerService.updateLocker(1L, requestDto);

        assertThat(result).isNotNull();
        assertThat(result.getLockerCode()).isEqualTo("L-001");
    }

    @Test
    void updateLocker_ShouldThrowBusinessException_WhenLockerCodeExistsOnAnotherLocker() {
        Locker otherLocker = Locker.builder().id(2L).lockerCode("L-001").build();
        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));
        when(lockerRepository.findByLockerCode("L-001")).thenReturn(Optional.of(otherLocker));

        assertThatThrownBy(() -> lockerService.updateLocker(1L, requestDto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("đã tồn tại");
    }

    @Test
    void deleteLocker_ShouldDelete_WhenNoActiveRentals() {
        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));
        when(lockerTransactionRepository.count(any(Specification.class))).thenReturn(0L);

        lockerService.deleteLocker(1L);

        verify(lockerRepository).delete(locker);
    }

    @Test
    void deleteLocker_ShouldThrowBusinessException_WhenActiveRentalsExist() {
        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));
        when(lockerTransactionRepository.count(any(Specification.class))).thenReturn(2L);

        assertThatThrownBy(() -> lockerService.deleteLocker(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Không thể xóa");
    }

    @Test
    void updateLockerStatus_ShouldUpdateStatusAndAvailability() {
        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));
        when(lockerRepository.save(any(Locker.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LockerResponseDto res1 = lockerService.updateLockerStatus(1L, Locker.LockerStatus.AVAILABLE);
        assertThat(res1.getCurrentAvailability()).isTrue();

        LockerResponseDto res2 = lockerService.updateLockerStatus(1L, Locker.LockerStatus.MAINTENANCE);
        assertThat(res2.getCurrentAvailability()).isFalse();
    }

    @Test
    void getLockerStatistics_ShouldCalculateCorrectStats() {
        when(lockerRepository.count()).thenReturn(10L);
        when(lockerRepository.count(any(Specification.class))).thenReturn(2L); // Mock for statuses
        
        LockerTransaction tx1 = LockerTransaction.builder()
                .status(LockerTransaction.LockerTransactionStatus.COMPLETED)
                .amountPaid(BigDecimal.valueOf(15000))
                .build();
        LockerTransaction tx2 = LockerTransaction.builder()
                .status(LockerTransaction.LockerTransactionStatus.COMPLETED)
                .amountPaid(BigDecimal.valueOf(25000))
                .build();
        when(lockerTransactionRepository.findAll()).thenReturn(List.of(tx1, tx2));
        when(lockerTransactionRepository.count()).thenReturn(5L);

        LockerDashboardStatsDto stats = lockerService.getLockerStatistics();

        assertThat(stats.getTotalLockers()).isEqualTo(10L);
        assertThat(stats.getRevenue()).isEqualByComparingTo(BigDecimal.valueOf(40000));
        assertThat(stats.getRentalCount()).isEqualTo(5L);
    }

    @Test
    void findLockersWithFilters_ShouldReturnFilteredPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Locker> page = new PageImpl<>(List.of(locker));
        when(lockerRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<LockerResponseDto> result = lockerService.findLockersWithFilters("L-001", Locker.LockerStatus.AVAILABLE, Locker.LockerSize.MEDIUM, pageable);

        assertThat(result.getContent()).hasSize(1);
    }
}
