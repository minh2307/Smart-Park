package com.smartpark.domain.locker.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.LockerMaintenance;
import com.smartpark.domain.locker.service.LockerMaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/locker-maintenances")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Locker Maintenances", description = "Quản lý lịch trình và sự cố bảo trì tủ đồ")
public class LockerMaintenanceController {

    private final LockerMaintenanceService lockerMaintenanceService;

    @GetMapping
    @Operation(summary = "Lấy danh sách lịch trình bảo trì tủ đồ")
    public ResponseEntity<ApiResponse<Page<LockerMaintenanceResponseDto>>> findAllMaintenances(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LockerMaintenance.MaintenanceStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(lockerMaintenanceService.findAllMaintenances(search, status, pageable)));
    }

    @PostMapping
    @Operation(summary = "Tạo yêu cầu bảo trì tủ đồ")
    public ResponseEntity<ApiResponse<LockerMaintenanceResponseDto>> createMaintenance(
            @Valid @RequestBody LockerMaintenanceRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success(lockerMaintenanceService.createMaintenance(dto)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật yêu cầu bảo trì tủ đồ")
    public ResponseEntity<ApiResponse<LockerMaintenanceResponseDto>> updateMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody LockerMaintenanceRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success(lockerMaintenanceService.updateMaintenance(id, dto)));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Hoàn thành yêu cầu bảo trì tủ đồ")
    public ResponseEntity<ApiResponse<LockerMaintenanceResponseDto>> completeMaintenance(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(lockerMaintenanceService.completeMaintenance(id)));
    }
}
