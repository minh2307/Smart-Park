package com.smartpark.domain.locker.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.service.LockerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lockers")
@RequiredArgsConstructor
public class LockerController {

    private final LockerService lockerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Locker>>> findAllLockers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.findAllLockers(pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Locker>> createLocker(@RequestBody Locker locker) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.createLocker(locker)));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<LockerTransaction>>> findAllTransactions(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.findAllTransactions(pageable)));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<LockerTransaction>> createTransaction(@RequestBody LockerTransaction tx) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.createTransaction(tx)));
    }
}
