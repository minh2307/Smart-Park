package com.smartpark.domain.locker.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.locker.dto.*;
import com.smartpark.domain.locker.entity.LockerTransaction;
import com.smartpark.domain.locker.service.LockerRentalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locker-rentals")
@RequiredArgsConstructor
@Tag(name = "Locker Rentals", description = "Quản lý thuê và trả tủ đồ thông minh")
public class LockerRentalController {

    private final LockerRentalService lockerRentalService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách tất cả các lượt thuê")
    public ResponseEntity<ApiResponse<Page<LockerRentalResponseDto>>> findAllRentals(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LockerTransaction.LockerTransactionStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(lockerRentalService.findAllRentals(search, status, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    @Operation(summary = "Lấy chi tiết lượt thuê theo ID")
    public ResponseEntity<ApiResponse<LockerRentalResponseDto>> findRentalById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(lockerRentalService.findRentalById(id)));
    }

    @PostMapping("/rent")
    @Operation(summary = "Đăng ký thuê tủ đồ (Khách tự thuê hoặc Admin đăng ký hộ)")
    public ResponseEntity<ApiResponse<LockerRentalResponseDto>> rentLocker(@Valid @RequestBody LockerRentalRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success(lockerRentalService.rentLocker(dto)));
    }

    @PostMapping("/return")
    @Operation(summary = "Trả tủ đồ và tính phí")
    public ResponseEntity<ApiResponse<LockerRentalResponseDto>> returnLocker(@Valid @RequestBody LockerRentalReturnDto dto) {
        return ResponseEntity.ok(ApiResponse.success(lockerRentalService.returnLocker(dto)));
    }

    @GetMapping("/current")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lấy danh sách tủ đồ đang thuê của khách hàng hiện tại")
    public ResponseEntity<ApiResponse<List<LockerRentalResponseDto>>> getMyCurrentRentals(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(lockerRentalService.findCurrentRentals(userDetails.getUsername())));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lịch sử thuê tủ đồ của khách hàng hiện tại")
    public ResponseEntity<ApiResponse<Page<LockerRentalResponseDto>>> getMyRentalHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(lockerRentalService.findRentalHistory(userDetails.getUsername(), pageable)));
    }
}
