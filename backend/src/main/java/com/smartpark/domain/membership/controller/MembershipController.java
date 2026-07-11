package com.smartpark.domain.membership.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.entity.PointHistory;
import com.smartpark.domain.membership.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Membership>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(membershipService.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Membership>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(membershipService.findById(id)));
    }

    @PatchMapping("/{id}/tier")
    public ResponseEntity<ApiResponse<Membership>> updateTier(@PathVariable Long id, @RequestParam Long tierId) {
        return ResponseEntity.ok(ApiResponse.success(membershipService.updateTier(id, tierId)));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<PointHistory>>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(membershipService.getHistory(id)));
    }
}
