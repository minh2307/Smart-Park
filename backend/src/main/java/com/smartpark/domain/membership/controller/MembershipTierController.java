package com.smartpark.domain.membership.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.membership.dto.MembershipTierDto;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.service.MembershipTierService;
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
@RequestMapping("/api/v1/membership-tiers")
@RequiredArgsConstructor
@Tag(name = "Membership Tier Management", description = "Quản lý hạng thẻ thành viên — benefits, rules, status")
public class MembershipTierController {

    private final MembershipTierService tierService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Lấy danh sách hạng thẻ", description = "Hỗ trợ search và filter status")
    public ResponseEntity<ApiResponse<Page<MembershipTierDto.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) MembershipTier.TierStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(tierService.getAll(search, status, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Chi tiết hạng thẻ")
    public ResponseEntity<ApiResponse<MembershipTierDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tierService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Tạo hạng thẻ mới")
    public ResponseEntity<ApiResponse<MembershipTierDto.Response>> create(
            @Valid @RequestBody MembershipTierDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(tierService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Cập nhật thông tin hạng thẻ")
    public ResponseEntity<ApiResponse<MembershipTierDto.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody MembershipTierDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Hạng thẻ đã được cập nhật thành công.", tierService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Xóa hạng thẻ (soft delete)")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        tierService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Hạng thẻ đã được xóa thành công."));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Cập nhật trạng thái hạng thẻ")
    public ResponseEntity<ApiResponse<MembershipTierDto.Response>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody MembershipTierDto.StatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Trạng thái hạng thẻ đã được cập nhật.", tierService.updateStatus(id, request)));
    }
}
