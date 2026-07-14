package com.smartpark.domain.locker.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.Locker;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.service.LockerService;
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
@RequestMapping("/api/v1/lockers")
@RequiredArgsConstructor
@Tag(name = "Lockers", description = "Quản lý tủ đồ thông minh")
public class LockerController {

    private final LockerService lockerService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tủ đồ với bộ lọc")
    public ResponseEntity<ApiResponse<Page<LockerResponseDto>>> findAllLockers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Locker.LockerStatus status,
            @RequestParam(required = false) Locker.LockerSize size,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.findLockersWithFilters(search, status, size, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết tủ đồ")
    public ResponseEntity<ApiResponse<LockerResponseDto>> findLockerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.findLockerById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo tủ đồ mới")
    public ResponseEntity<ApiResponse<LockerResponseDto>> createLocker(@Valid @RequestBody LockerRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.createLockerDto(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin tủ đồ")
    public ResponseEntity<ApiResponse<LockerResponseDto>> updateLocker(@PathVariable Long id, @Valid @RequestBody LockerRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.updateLocker(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa tủ đồ")
    public ResponseEntity<ApiResponse<Void>> deleteLocker(@PathVariable Long id) {
        lockerService.deleteLocker(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tủ đồ thành công.", null));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật trạng thái tủ đồ")
    public ResponseEntity<ApiResponse<LockerResponseDto>> updateLockerStatus(@PathVariable Long id, @RequestParam Locker.LockerStatus status) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.updateLockerStatus(id, status)));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Lấy thống kê hoạt động tủ đồ")
    public ResponseEntity<ApiResponse<LockerDashboardStatsDto>> getLockerStatistics() {
        return ResponseEntity.ok(ApiResponse.success(lockerService.getLockerStatistics()));
    }

    // Keep old endpoints for backward compatibility if any legacy code calls them
    @GetMapping("/legacy")
    public ResponseEntity<ApiResponse<Page<Locker>>> findAllLockersLegacy(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(lockerService.findAllLockers(pageable)));
    }

    @PostMapping("/legacy")
    public ResponseEntity<ApiResponse<Locker>> createLockerLegacy(@RequestBody Locker locker) {
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
