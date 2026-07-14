package com.smartpark.domain.locker.service;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.locker.dto.LockerMaintenanceRequestDto;
import com.smartpark.domain.locker.dto.LockerMaintenanceResponseDto;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerMaintenance;
import com.smartpark.domain.locker.repository.LockerMaintenanceRepository;
import com.smartpark.domain.locker.repository.LockerRepository;
import com.smartpark.domain.locker.service.impl.LockerMaintenanceServiceImpl;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LockerMaintenanceServiceTest {

    @Mock
    private LockerMaintenanceRepository lockerMaintenanceRepository;

    @Mock
    private LockerRepository lockerRepository;

    @InjectMocks
    private LockerMaintenanceServiceImpl lockerMaintenanceService;

    private Locker locker;
    private LockerMaintenance maintenance;
    private LockerMaintenanceRequestDto requestDto;

    @BeforeEach
    void setUp() {
        locker = Locker.builder()
                .id(1L)
                .lockerCode("L-001")
                .status(Locker.LockerStatus.AVAILABLE)
                .currentAvailability(true)
                .build();

        maintenance = LockerMaintenance.builder()
                .id(100L)
                .locker(locker)
                .maintenanceDate(LocalDateTime.now())
                .reason("Lock broken")
                .technician("Alice")
                .maintenanceStatus(LockerMaintenance.MaintenanceStatus.SCHEDULED)
                .build();

        requestDto = LockerMaintenanceRequestDto.builder()
                .lockerId(1L)
                .maintenanceDate(LocalDateTime.now().plusDays(1))
                .reason("Regular checkup")
                .technician("Bob")
                .maintenanceStatus(LockerMaintenance.MaintenanceStatus.SCHEDULED)
                .build();
    }

    @Test
    void findAllMaintenances_ShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<LockerMaintenance> page = new PageImpl<>(List.of(maintenance));
        when(lockerMaintenanceRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<LockerMaintenanceResponseDto> result = lockerMaintenanceService.findAllMaintenances("Alice", LockerMaintenance.MaintenanceStatus.SCHEDULED, pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void createMaintenance_ShouldLockLockerAndSave() {
        when(lockerRepository.findById(1L)).thenReturn(Optional.of(locker));
        when(lockerMaintenanceRepository.save(any(LockerMaintenance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LockerMaintenanceResponseDto result = lockerMaintenanceService.createMaintenance(requestDto);

        assertThat(result).isNotNull();
        assertThat(locker.getStatus()).isEqualTo(Locker.LockerStatus.MAINTENANCE);
        assertThat(locker.getCurrentAvailability()).isFalse();
    }

    @Test
    void createMaintenance_ShouldThrowResourceNotFoundException_WhenLockerNotFound() {
        when(lockerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lockerMaintenanceService.createMaintenance(requestDto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateMaintenance_ShouldUpdateLockerReassignmentCorrectly() {
        Locker oldLocker = Locker.builder().id(1L).status(Locker.LockerStatus.MAINTENANCE).currentAvailability(false).build();
        Locker newLocker = Locker.builder().id(2L).status(Locker.LockerStatus.AVAILABLE).currentAvailability(true).build();
        maintenance.setLocker(oldLocker);

        requestDto.setLockerId(2L);

        when(lockerMaintenanceRepository.findById(100L)).thenReturn(Optional.of(maintenance));
        when(lockerRepository.findById(2L)).thenReturn(Optional.of(newLocker));
        when(lockerMaintenanceRepository.save(any(LockerMaintenance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LockerMaintenanceResponseDto result = lockerMaintenanceService.updateMaintenance(100L, requestDto);

        assertThat(result).isNotNull();
        assertThat(oldLocker.getStatus()).isEqualTo(Locker.LockerStatus.AVAILABLE);
        assertThat(oldLocker.getCurrentAvailability()).isTrue();
        assertThat(newLocker.getStatus()).isEqualTo(Locker.LockerStatus.MAINTENANCE);
        assertThat(newLocker.getCurrentAvailability()).isFalse();
    }

    @Test
    void updateMaintenance_ShouldReleaseLocker_WhenStatusChangedToCompleted() {
        requestDto.setMaintenanceStatus(LockerMaintenance.MaintenanceStatus.COMPLETED);

        when(lockerMaintenanceRepository.findById(100L)).thenReturn(Optional.of(maintenance));
        when(lockerMaintenanceRepository.save(any(LockerMaintenance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LockerMaintenanceResponseDto result = lockerMaintenanceService.updateMaintenance(100L, requestDto);

        assertThat(result).isNotNull();
        assertThat(result.getMaintenanceStatus()).isEqualTo(LockerMaintenance.MaintenanceStatus.COMPLETED);
        assertThat(locker.getStatus()).isEqualTo(Locker.LockerStatus.AVAILABLE);
        assertThat(locker.getCurrentAvailability()).isTrue();
        assertThat(maintenance.getCompletionDate()).isNotNull();
    }

    @Test
    void completeMaintenance_ShouldReleaseLockerAndSetCompletionDate() {
        when(lockerMaintenanceRepository.findById(100L)).thenReturn(Optional.of(maintenance));
        when(lockerMaintenanceRepository.save(any(LockerMaintenance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LockerMaintenanceResponseDto result = lockerMaintenanceService.completeMaintenance(100L);

        assertThat(result).isNotNull();
        assertThat(result.getMaintenanceStatus()).isEqualTo(LockerMaintenance.MaintenanceStatus.COMPLETED);
        assertThat(locker.getStatus()).isEqualTo(Locker.LockerStatus.AVAILABLE);
        assertThat(locker.getCurrentAvailability()).isTrue();
        assertThat(maintenance.getCompletionDate()).isNotNull();
    }
}
