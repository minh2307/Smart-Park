package com.smartpark.domain.food.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.food.entity.FoodItem;
import com.smartpark.domain.food.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FoodItem>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(foodService.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodItem>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(foodService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FoodItem>> create(@RequestBody FoodItem foodItem) {
        return ResponseEntity.ok(ApiResponse.success(foodService.create(foodItem)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        foodService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success("Món ăn đã bị vô hiệu hóa."));
    }
}
