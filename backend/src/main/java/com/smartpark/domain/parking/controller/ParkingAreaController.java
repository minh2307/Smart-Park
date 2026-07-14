package com.smartpark.domain.parking.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.parking.dto.ParkingAreaDto;
import com.smartpark.domain.parking.entity.ParkingLot;
import com.smartpark.domain.parking.service.ParkingAreaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/parking-areas")
@RequiredArgsConstructor
@Tag(name = "Parking Area Management", description = "Quản lý bãi đỗ xe — capacity, pricing, status")
public class ParkingAreaController {

    private final ParkingAreaService parkingAreaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lấy danh sách bãi đỗ xe", description = "Hỗ trợ filter theo status, vehicleType, search. Phân trang.")
    public ResponseEntity<ApiResponse<Page<ParkingAreaDto.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ParkingLot.ParkingLotStatus status,
            @RequestParam(required = false) ParkingLot.VehicleType vehicleType,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                parkingAreaService.getAll(search, status, vehicleType, pageable)));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Thống kê bãi đỗ xe", description = "Tổng hợp capacity, occupancy, số bãi theo status.")
    public ResponseEntity<ApiResponse<ParkingAreaDto.Statistics>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success(parkingAreaService.getStatistics()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Chi tiết bãi đỗ xe theo ID")
    public ResponseEntity<ApiResponse<ParkingAreaDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(parkingAreaService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo bãi đỗ xe mới")
    public ResponseEntity<ApiResponse<ParkingAreaDto.Response>> create(
            @Valid @RequestBody ParkingAreaDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(parkingAreaService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật bãi đỗ xe")
    public ResponseEntity<ApiResponse<ParkingAreaDto.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody ParkingAreaDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Bãi đỗ xe đã được cập nhật thành công.",
                parkingAreaService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa bãi đỗ xe (soft delete)", description = "Không thể xóa nếu còn phiên đỗ xe đang hoạt động.")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        parkingAreaService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Bãi đỗ xe đã được xóa thành công."));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Cập nhật trạng thái bãi đỗ xe", description = "Chuyển trạng thái: ACTIVE / FULL / CLOSED.")
    public ResponseEntity<ApiResponse<ParkingAreaDto.Response>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ParkingAreaDto.StatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Trạng thái bãi đỗ xe đã được cập nhật.",
                parkingAreaService.updateStatus(id, request)));
    }
}
