package com.gateos.module.venue.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.module.venue.dto.VenueRequest;
import com.gateos.module.venue.entity.Venue;
import com.gateos.module.venue.service.VenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/venues")
@RequiredArgsConstructor
@Tag(name = "Venue Management", description = "Quản lý địa điểm vui chơi")
public class VenueController {

    private final VenueService venueService;

    @Operation(summary = "Lấy danh sách địa điểm (phân trang)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Venue>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(direction, sortParts[0]));
        return ResponseEntity.ok(ApiResponse.ok(venueService.getAll(search, status, pageable)));
    }

    @Operation(summary = "Lấy chi tiết một địa điểm")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Venue>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(venueService.getById(id)));
    }

    @Operation(summary = "Tạo mới địa điểm")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Venue>> create(@Valid @RequestBody VenueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(venueService.create(request), "Thêm địa điểm thành công"));
    }

    @Operation(summary = "Cập nhật thông tin địa điểm")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Venue>> update(@PathVariable Long id, @Valid @RequestBody VenueRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(venueService.update(id, request), "Cập nhật địa điểm thành công"));
    }

    @Operation(summary = "Xóa mềm địa điểm (chuyển INACTIVE)")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        venueService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success("Địa điểm đã được vô hiệu hóa"));
    }
}
