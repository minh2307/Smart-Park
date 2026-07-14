package com.smartpark.domain.parking.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.parking.dto.GateDto;
import com.smartpark.domain.parking.entity.Gate;
import com.smartpark.domain.parking.service.GateService;
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
@RequestMapping("/api/v1/gates")
@RequiredArgsConstructor
@Tag(name = "Gate Management", description = "Quản lý cổng vào/ra công viên — trạng thái, loại, thiết bị")
public class GateController {

    private final GateService gateService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Lấy danh sách cổng",
               description = "Filter: search, status, type, parkingAreaId, zoneId. Phân trang.")
    public ResponseEntity<ApiResponse<Page<GateDto.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Gate.GateStatus status,
            @RequestParam(required = false) Gate.GateType type,
            @RequestParam(required = false) Long parkingAreaId,
            @RequestParam(required = false) Long zoneId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                gateService.getAll(search, status, type, parkingAreaId, zoneId, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Chi tiết cổng theo ID")
    public ResponseEntity<ApiResponse<GateDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(gateService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo cổng mới", description = "Mã cổng (code) phải unique trong toàn hệ thống.")
    public ResponseEntity<ApiResponse<GateDto.Response>> create(
            @Valid @RequestBody GateDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(gateService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin cổng")
    public ResponseEntity<ApiResponse<GateDto.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody GateDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cổng đã được cập nhật thành công.",
                gateService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa cổng (soft delete)")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        gateService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Cổng đã được xóa thành công."));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Cập nhật trạng thái cổng", description = "Chuyển: OPEN / CLOSED / MAINTENANCE.")
    public ResponseEntity<ApiResponse<GateDto.Response>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody GateDto.StatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Trạng thái cổng đã được cập nhật.",
                gateService.updateStatus(id, request)));
    }
}
