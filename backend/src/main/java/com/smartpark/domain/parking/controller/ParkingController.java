package com.smartpark.domain.parking.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.parking.entity.ParkingTransaction;
import com.smartpark.domain.parking.service.ParkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/parking")
@RequiredArgsConstructor
public class ParkingController {

    private final ParkingService parkingService;

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<ParkingTransaction>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(parkingService.findAll(pageable)));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<ParkingTransaction>> create(@RequestBody ParkingTransaction tx) {
        return ResponseEntity.ok(ApiResponse.success(parkingService.create(tx)));
    }
}
