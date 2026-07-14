package com.smartpark.domain.parking.service;

import com.smartpark.domain.parking.dto.ParkingAreaDto;
import com.smartpark.domain.parking.entity.ParkingLot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ParkingAreaService {

    Page<ParkingAreaDto.Response> getAll(String search, ParkingLot.ParkingLotStatus status,
                                         ParkingLot.VehicleType vehicleType, Pageable pageable);

    ParkingAreaDto.Response getById(Long id);

    ParkingAreaDto.Response create(ParkingAreaDto.CreateRequest request);

    ParkingAreaDto.Response update(Long id, ParkingAreaDto.UpdateRequest request);

    void delete(Long id);

    ParkingAreaDto.Response updateStatus(Long id, ParkingAreaDto.StatusRequest request);

    ParkingAreaDto.Statistics getStatistics();
}
