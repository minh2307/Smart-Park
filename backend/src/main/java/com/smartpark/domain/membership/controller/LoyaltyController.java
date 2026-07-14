package com.smartpark.domain.membership.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.membership.dto.LoyaltyDto;
import com.smartpark.domain.membership.entity.PointHistory;
import com.smartpark.domain.membership.service.LoyaltyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/loyalty")
@RequiredArgsConstructor
@Tag(name = "Loyalty Management", description = "Quản lý điểm thưởng và lịch sử giao dịch điểm")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Lấy danh sách tài khoản Loyalty")
    public ResponseEntity<ApiResponse<Page<LoyaltyDto.AccountResponse>>> getAllAccounts(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(loyaltyService.getAllAccounts(search, pageable)));
    }

    @GetMapping("/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Lấy tài khoản Loyalty của khách hàng")
    public ResponseEntity<ApiResponse<LoyaltyDto.AccountResponse>> getByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(loyaltyService.getAccountByCustomerId(customerId)));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE', 'CUSTOMER')")
    @Operation(summary = "Lấy lịch sử giao dịch điểm", description = "Hỗ trợ search, filter type, membershipId")
    public ResponseEntity<ApiResponse<Page<LoyaltyDto.TransactionResponse>>> getHistory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PointHistory.TransactionType type,
            @RequestParam(required = false) Long membershipId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(loyaltyService.getHistory(search, type, membershipId, pageable)));
    }

    @PostMapping("/earn")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'FINANCE_MANAGER')")
    @Operation(summary = "Tích lũy điểm thưởng")
    public ResponseEntity<ApiResponse<LoyaltyDto.TransactionResponse>> earn(
            @Valid @RequestBody LoyaltyDto.EarnRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tích lũy điểm thành công.", loyaltyService.earnPoints(request)));
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Quy đổi điểm thưởng")
    public ResponseEntity<ApiResponse<LoyaltyDto.TransactionResponse>> redeem(
            @Valid @RequestBody LoyaltyDto.RedeemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Quy đổi điểm thành công.", loyaltyService.redeemPoints(request)));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Điều chỉnh điểm thưởng thủ công")
    public ResponseEntity<ApiResponse<LoyaltyDto.TransactionResponse>> adjust(
            @Valid @RequestBody LoyaltyDto.AdjustRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Điều chỉnh điểm thành công.", loyaltyService.adjustPoints(request)));
    }
}
