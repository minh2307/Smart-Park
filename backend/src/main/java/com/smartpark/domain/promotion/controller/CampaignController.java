package com.smartpark.domain.promotion.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.promotion.dto.CampaignRequestDto;
import com.smartpark.domain.promotion.dto.CampaignResponseDto;
import com.smartpark.domain.promotion.dto.CampaignStatisticsDto;
import com.smartpark.domain.promotion.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<Page<CampaignResponseDto>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String campaignType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<CampaignResponseDto> campaigns = campaignService.findAll(search, campaignType, status, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(campaigns));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> create(@Valid @RequestBody CampaignRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> update(@PathVariable Long id, @Valid @RequestBody CampaignRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        campaignService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> activate(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.activate(id)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    public ResponseEntity<ApiResponse<CampaignResponseDto>> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.deactivate(id)));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'ANALYST', 'FINANCE_MANAGER')")
    public ResponseEntity<ApiResponse<CampaignStatisticsDto>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success(campaignService.getStatistics()));
    }
}
