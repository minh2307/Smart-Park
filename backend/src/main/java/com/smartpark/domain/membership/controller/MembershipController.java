package com.smartpark.domain.membership.controller;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.membership.dto.MembershipDto;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.entity.PointHistory;
import com.smartpark.domain.membership.repository.MembershipTierRepository;
import com.smartpark.domain.membership.service.MembershipManagementService;
import com.smartpark.domain.membership.service.MembershipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/memberships")
@RequiredArgsConstructor
@Tag(name = "Memberships", description = "Quản lý thẻ thành viên khách hàng và hạng thẻ")
public class MembershipController {

    private final MembershipService membershipService;
    private final MembershipManagementService membershipManagementService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final MembershipTierRepository membershipTierRepository;

    // ──────────────────────── Admin: CRUD & Lifecycle ────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Lấy danh sách thẻ thành viên",
            description = "Hỗ trợ search (mã thẻ/tên KH), filter status, tierId, khoảng ngày hết hạn. Phân trang.")
    public ResponseEntity<ApiResponse<Page<MembershipDto.Response>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Membership.MembershipStatus status,
            @RequestParam(required = false) Long tierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryTo,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                membershipManagementService.getAll(search, status, tierId, expiryFrom, expiryTo, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Chi tiết thẻ thành viên")
    public ResponseEntity<ApiResponse<MembershipDto.Response>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(membershipManagementService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Tạo thẻ thành viên mới")
    public ResponseEntity<ApiResponse<MembershipDto.Response>> create(
            @Valid @RequestBody MembershipDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(membershipManagementService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Cập nhật thông tin thẻ thành viên")
    public ResponseEntity<ApiResponse<MembershipDto.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody MembershipDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Thẻ thành viên đã được cập nhật thành công.",
                membershipManagementService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Xóa thẻ thành viên (soft cancel)")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        membershipManagementService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Thẻ thành viên đã được xóa/hủy thành công."));
    }

    @PatchMapping("/{id}/upgrade")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Nâng hạng thẻ thành viên")
    public ResponseEntity<ApiResponse<MembershipDto.Response>> upgrade(
            @PathVariable Long id,
            @Valid @RequestBody MembershipDto.UpgradeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Nâng hạng thẻ thành công.",
                membershipManagementService.upgrade(id, request)));
    }

    @PatchMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Gia hạn thẻ thành viên")
    public ResponseEntity<ApiResponse<MembershipDto.Response>> renew(
            @PathVariable Long id,
            @Valid @RequestBody MembershipDto.RenewRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Gia hạn thẻ thành công.",
                membershipManagementService.renew(id, request)));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'CRM_MANAGER')")
    @Operation(summary = "Hủy thẻ thành viên")
    public ResponseEntity<ApiResponse<MembershipDto.Response>> cancel(
            @PathVariable Long id,
            @Valid @RequestBody MembershipDto.CancelRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Thẻ thành viên đã được hủy.",
                membershipManagementService.cancel(id, request)));
    }

    // ──────────────────────── Legacy / Customer self-service APIs ────────────────────────

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Lấy thẻ thành viên của khách hàng đang đăng nhập")
    public ResponseEntity<ApiResponse<Membership>> getMyMembership(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = resolveCustomerId(userDetails.getUsername());
        Membership membership = membershipService.findByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success(membership));
    }

    @GetMapping("/me/history")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Lịch sử điểm thưởng của khách hàng đang đăng nhập")
    public ResponseEntity<ApiResponse<List<PointHistory>>> getMyHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = resolveCustomerId(userDetails.getUsername());
        Membership membership = membershipService.findByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success(membershipService.getHistory(membership.getId())));
    }

    @GetMapping("/tiers")
    @Operation(summary = "Lấy danh sách tất cả hạng thẻ thành viên")
    public ResponseEntity<ApiResponse<List<MembershipTier>>> getAllTiers() {
        return ResponseEntity.ok(ApiResponse.success(membershipTierRepository.findAll()));
    }

    @PatchMapping("/{id}/tier")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật trực tiếp hạng thẻ (Legacy)")
    public ResponseEntity<ApiResponse<Membership>> updateTier(@PathVariable Long id, @RequestParam Long tierId) {
        return ResponseEntity.ok(ApiResponse.success(membershipService.updateTier(id, tierId)));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lịch sử điểm theo ID thẻ (Legacy)")
    public ResponseEntity<ApiResponse<List<PointHistory>>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(membershipService.getHistory(id)));
    }

    // ──────── Helper ────────

    private Long resolveCustomerId(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer for user", username));
        return customer.getId();
    }
}
