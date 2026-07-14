package com.smartpark.domain.locker.mapper;

import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.*;
import com.smartpark.domain.park.entity.Zone;

public class LockerMapper {

    public static LockerResponseDto toResponseDto(Locker locker) {
        if (locker == null) return null;
        return LockerResponseDto.builder()
                .id(locker.getId())
                .zoneId(locker.getZone() != null ? locker.getZone().getId() : null)
                .zoneName(locker.getZone() != null ? locker.getZone().getName() : null)
                .lockerCode(locker.getLockerCode())
                .lockerNumber(locker.getLockerNumber())
                .type(locker.getType())
                .rentalPrice(locker.getRentalPrice())
                .size(locker.getSize())
                .status(locker.getStatus())
                .location(locker.getLocation())
                .qrCode(locker.getQrCode())
                .currentAvailability(locker.getCurrentAvailability())
                .createdAt(locker.getCreatedAt())
                .updatedAt(locker.getUpdatedAt())
                .build();
    }

    public static Locker toEntity(LockerRequestDto dto, Zone zone) {
        if (dto == null) return null;
        return Locker.builder()
                .zone(zone)
                .lockerCode(dto.getLockerCode())
                .lockerNumber(dto.getLockerNumber())
                .type(dto.getType())
                .rentalPrice(dto.getRentalPrice())
                .size(dto.getSize())
                .status(dto.getStatus() != null ? dto.getStatus() : Locker.LockerStatus.AVAILABLE)
                .location(dto.getLocation())
                .qrCode(dto.getQrCode())
                .currentAvailability(dto.getCurrentAvailability() != null ? dto.getCurrentAvailability() : true)
                .build();
    }

    public static void updateEntity(Locker locker, LockerRequestDto dto, Zone zone) {
        if (dto == null || locker == null) return;
        if (zone != null) {
            locker.setZone(zone);
        }
        locker.setLockerCode(dto.getLockerCode());
        locker.setLockerNumber(dto.getLockerNumber());
        locker.setType(dto.getType());
        locker.setRentalPrice(dto.getRentalPrice());
        locker.setSize(dto.getSize());
        if (dto.getStatus() != null) {
            locker.setStatus(dto.getStatus());
        }
        locker.setLocation(dto.getLocation());
        locker.setQrCode(dto.getQrCode());
        if (dto.getCurrentAvailability() != null) {
            locker.setCurrentAvailability(dto.getCurrentAvailability());
        }
    }

    public static LockerRentalResponseDto toRentalResponseDto(LockerTransaction rental) {
        if (rental == null) return null;
        return LockerRentalResponseDto.builder()
                .id(rental.getId())
                .lockerId(rental.getLocker() != null ? rental.getLocker().getId() : null)
                .lockerCode(rental.getLocker() != null ? rental.getLocker().getLockerCode() : null)
                .customerId(rental.getCustomer() != null ? rental.getCustomer().getId() : null)
                .customerName(rental.getCustomer() != null ? rental.getCustomer().getFullName() : null)
                .startTime(rental.getStartTime())
                .endTime(rental.getEndTime())
                .deposit(rental.getDeposit())
                .rentalFee(rental.getRentalFee())
                .amountPaid(rental.getAmountPaid())
                .penaltyAmount(rental.getPenaltyAmount())
                .status(rental.getStatus())
                .paymentStatus(rental.getPaymentStatus())
                .build();
    }

    public static LockerMaintenanceResponseDto toMaintenanceResponseDto(LockerMaintenance maintenance) {
        if (maintenance == null) return null;
        return LockerMaintenanceResponseDto.builder()
                .id(maintenance.getId())
                .lockerId(maintenance.getLocker() != null ? maintenance.getLocker().getId() : null)
                .lockerCode(maintenance.getLocker() != null ? maintenance.getLocker().getLockerCode() : null)
                .lockerNumber(maintenance.getLocker() != null ? maintenance.getLocker().getLockerNumber() : null)
                .maintenanceDate(maintenance.getMaintenanceDate())
                .reason(maintenance.getReason())
                .technician(maintenance.getTechnician())
                .completionDate(maintenance.getCompletionDate())
                .maintenanceStatus(maintenance.getMaintenanceStatus())
                .createdAt(maintenance.getCreatedAt())
                .updatedAt(maintenance.getUpdatedAt())
                .build();
    }
}
