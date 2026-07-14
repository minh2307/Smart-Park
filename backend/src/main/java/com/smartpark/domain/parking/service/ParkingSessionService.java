package com.smartpark.domain.parking.service;

import com.smartpark.domain.parking.dto.ParkingSessionDto;
import com.smartpark.domain.parking.entity.ParkingTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface ParkingSessionService {

    Page<ParkingSessionDto.Response> getAll(
            String licensePlate,
            ParkingTransaction.ParkingStatus status,
            Long parkingAreaId,
            Long entryGateId,
            ParkingTransaction.VehicleType vehicleType,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable);

    ParkingSessionDto.Response getById(Long id);

    ParkingSessionDto.Response checkIn(ParkingSessionDto.CheckInRequest request);

    ParkingSessionDto.Response checkOut(ParkingSessionDto.CheckOutRequest request);

    Page<ParkingSessionDto.Response> getCurrentSessions(Pageable pageable);

    Page<ParkingSessionDto.Response> getHistory(Pageable pageable);
}
