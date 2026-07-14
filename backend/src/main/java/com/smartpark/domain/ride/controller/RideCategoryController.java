package com.smartpark.domain.ride.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.ride.entity.RideCategory;
import com.smartpark.domain.ride.service.RideCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ride-categories")
@RequiredArgsConstructor
public class RideCategoryController {

    private final RideCategoryService rideCategoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RideCategory>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(rideCategoryService.findAll(search, status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RideCategory>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(rideCategoryService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RideCategory>> create(@RequestBody RideCategory category) {
        return ResponseEntity.ok(ApiResponse.success(rideCategoryService.create(category)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RideCategory>> update(@PathVariable Long id, @RequestBody RideCategory category) {
        return ResponseEntity.ok(ApiResponse.success(rideCategoryService.update(id, category)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        rideCategoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
