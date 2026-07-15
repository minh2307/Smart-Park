package com.smartpark.domain.inventory.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.inventory.dto.InventoryDto;
import com.smartpark.domain.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasAuthority('RETAIL_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryDto.ItemResponse>>> findAll(
            @RequestParam(required = false) String sku, @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) String status, @RequestParam(required = false) Boolean lowStock,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.findAll(sku, shopId, status, lowStock, pageable)));
    }

    @GetMapping("/{sku}")
    @PreAuthorize("hasAuthority('RETAIL_VIEW')")
    public ResponseEntity<ApiResponse<InventoryDto.ItemResponse>> findOne(@PathVariable String sku) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.findBySku(sku)));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('RETAIL_UPDATE')")
    public ResponseEntity<ApiResponse<InventoryDto.ItemResponse>> adjust(@Valid @RequestBody InventoryDto.AdjustmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.adjust(request)));
    }

    @PutMapping("/{sku}")
    @PreAuthorize("hasAuthority('RETAIL_UPDATE')")
    public ResponseEntity<ApiResponse<InventoryDto.ItemResponse>> adjustBySku(
            @PathVariable String sku, @Valid @RequestBody InventoryDto.AdjustmentRequest request) {
        if (!sku.equalsIgnoreCase(request.getSku())) {
            throw new com.smartpark.common.exception.BusinessException("ERR-INVENTORY-003", "Path SKU and body SKU must match.");
        }
        return ResponseEntity.ok(ApiResponse.success(inventoryService.adjust(request)));
    }
}
