package com.smartpark.domain.parking.service;

import com.smartpark.domain.parking.dto.GateDto;
import com.smartpark.domain.parking.entity.Gate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GateService {

    Page<GateDto.Response> getAll(String search, Gate.GateStatus status, Gate.GateType type,
                                  Long parkingAreaId, Long zoneId, Pageable pageable);

    GateDto.Response getById(Long id);

    GateDto.Response create(GateDto.CreateRequest request);

    GateDto.Response update(Long id, GateDto.UpdateRequest request);

    void delete(Long id);

    GateDto.Response updateStatus(Long id, GateDto.StatusRequest request);
}
