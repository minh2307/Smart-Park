package com.smartpark.domain.parking.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.parking.dto.ParkingSessionDto;
import com.smartpark.domain.parking.entity.ParkingTransaction;
import com.smartpark.domain.parking.service.ParkingSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/parking-sessions")
@RequiredArgsConstructor
@Tag(name = "Parking Session Management", description = "Quản lý phiên đỗ xe — check-in, check-out, tính phí")
public class ParkingSessionController {

    private final ParkingSessionService parkingSessionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lấy danh sách phiên đỗ xe",
               description = "Filter: licensePlate, status, parkingAreaId, entryGateId, vehicleType, fromDate, toDate.")
    public ResponseEntity<ApiResponse<Page<ParkingSessionDto.Response>>> getAll(
            @RequestParam(required = false) String licensePlate,
            @RequestParam(required = false) ParkingTransaction.ParkingStatus status,
            @RequestParam(required = false) Long parkingAreaId,
            @RequestParam(required = false) Long entryGateId,
            @RequestParam(required = false) ParkingTransaction.VehicleType vehicleType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                parkingSessionService.getAll(licensePlate, status, parkingAreaId,
                        entryGateId, vehicleType, fromDate, toDate, pageable)));
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lấy danh sách xe đang trong bãi", description = "Tất cả phiên có status = PARKED.")
    public ResponseEntity<ApiResponse<Page<ParkingSessionDto.Response>>> getCurrent(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(parkingSessionService.getCurrentSessions(pageable)));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lịch sử phiên đỗ xe đã kết thúc", description = "Tất cả phiên có status = EXITED.")
    public ResponseEntity<ApiResponse<Page<ParkingSessionDto.Response>>> getHistory(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(parkingSessionService.getHistory(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Chi tiết phiên đỗ xe theo ID")
    public ResponseEntity<ApiResponse<ParkingSessionDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(parkingSessionService.getById(id)));
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Xe vào bãi (Check-in)", description = "Tạo phiên đỗ xe mới. Biển số phải chưa có phiên đang mở.")
    public ResponseEntity<ApiResponse<ParkingSessionDto.Response>> checkIn(
            @Valid @RequestBody ParkingSessionDto.CheckInRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(parkingSessionService.checkIn(request)));
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Xe ra bãi (Check-out)", description = "Tìm phiên đang mở theo biển số, tính phí, đóng phiên.")
    public ResponseEntity<ApiResponse<ParkingSessionDto.Response>> checkOut(
            @Valid @RequestBody ParkingSessionDto.CheckOutRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Xe đã ra khỏi bãi thành công.",
                parkingSessionService.checkOut(request)));
    }
}
