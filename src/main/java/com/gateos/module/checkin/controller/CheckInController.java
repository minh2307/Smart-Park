package com.gateos.module.checkin.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.module.checkin.entity.CheckIn;
import com.gateos.module.checkin.service.CheckInService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/check-in")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Access Control / Check-in", description = "Soát vé QR và kiểm soát ra vào")
public class CheckInController {

    private final CheckInService checkInService;

    @Operation(summary = "Quét mã QR soát vé tại cổng")
    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('GATE_STAFF', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scan(@RequestBody Map<String, Object> body) {
        String ticketCode = (String) body.get("ticketCode");
        Long gateStaffId = body.get("gateStaffId") != null ? Long.parseLong(body.get("gateStaffId").toString()) : null;
        Long attractionId = body.get("attractionId") != null ? Long.parseLong(body.get("attractionId").toString()) : null;

        Map<String, Object> result = checkInService.scan(ticketCode, gateStaffId, attractionId);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return ResponseEntity.ok(ApiResponse.ok(result, success ? "Check-in thành công" : "Check-in thất bại"));
    }

    @Operation(summary = "Mở cổng cưỡng bức (Override)")
    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('GATE_STAFF', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> manualOverride(@RequestBody Map<String, String> body) {
        String ticketCode = body.get("ticketCode");
        String reason = body.getOrDefault("reason", "Manual override by staff");
        return ResponseEntity.ok(ApiResponse.ok(checkInService.manualOverride(ticketCode, 1L, reason)));
    }

    @Operation(summary = "Xem lịch sử check-in")
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'GATE_STAFF')")
    public ResponseEntity<ApiResponse<Page<CheckIn>>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.ok(checkInService.getHistory(PageRequest.of(page, size))));
    }
}
