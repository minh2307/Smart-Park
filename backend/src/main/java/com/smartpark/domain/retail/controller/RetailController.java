package com.smartpark.domain.retail.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.retail.entity.RetailItem;
import com.smartpark.domain.retail.service.RetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/retails")
@RequiredArgsConstructor
public class RetailController {

    private final RetailService retailService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RetailItem>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(retailService.findAll(pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RetailItem>> create(@RequestBody RetailItem retailItem) {
        return ResponseEntity.ok(ApiResponse.success(retailService.create(retailItem)));
    }

    @PatchMapping("/{id}/stock")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('RETAIL_UPDATE')")
    public ResponseEntity<ApiResponse<RetailItem>> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        return ResponseEntity.ok(ApiResponse.success(retailService.updateStock(id, quantity)));
    }
}
