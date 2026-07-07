package com.gateos.module.attraction.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.module.attraction.dto.AttractionRequest;
import com.gateos.module.attraction.entity.Attraction;
import com.gateos.module.attraction.service.AttractionService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequiredArgsConstructor
@Tag(name = "Attraction Management", description = "Quản lý trò chơi / khu vực")
public class AttractionController {

    private final AttractionService attractionService;

    @Operation(summary = "Lấy danh sách trò chơi theo địa điểm")
    @GetMapping("/api/v1/venues/{venueId}/attractions")
    public ResponseEntity<ApiResponse<Page<Attraction>>> getByVenue(
            @PathVariable Long venueId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                attractionService.getByVenue(venueId, PageRequest.of(page, size, Sort.by("name")))));
    }

    @Operation(summary = "Lấy chi tiết trò chơi")
    @GetMapping("/api/v1/attractions/{id}")
    public ResponseEntity<ApiResponse<Attraction>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(attractionService.getById(id)));
    }

    @Operation(summary = "Tạo mới trò chơi")
    @PostMapping("/api/v1/attractions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Attraction>> create(@Valid @RequestBody AttractionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(attractionService.create(request), "Thêm trò chơi thành công"));
    }

    @Operation(summary = "Cập nhật trò chơi")
    @PutMapping("/api/v1/attractions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Attraction>> update(@PathVariable Long id, @Valid @RequestBody AttractionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(attractionService.update(id, request), "Cập nhật thành công"));
    }

    @Operation(summary = "Xóa mềm trò chơi")
    @DeleteMapping("/api/v1/attractions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        attractionService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success("Trò chơi đã được vô hiệu hóa"));
    }
}
