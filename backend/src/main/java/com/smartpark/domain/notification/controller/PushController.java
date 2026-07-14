package com.smartpark.domain.notification.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.notification.dto.PushDto;
import com.smartpark.domain.notification.service.PushService;
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
@RequestMapping("/api/v1/push")
@RequiredArgsConstructor
@Tag(name = "Push Notifications & History", description = "API quản lý gửi thông báo đẩy (Firebase Push) và tra cứu lịch sử gửi")
public class PushController {

    private final PushService pushService;

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Gửi Push Notification đơn lẻ")
    public ResponseEntity<ApiResponse<PushDto.Response>> sendPush(
            @Valid @RequestBody PushDto.SendRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(pushService.sendPush(request)));
    }

    @PostMapping("/send-bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Gửi Push Notification hàng loạt")
    public ResponseEntity<ApiResponse<String>> sendPushBulk(
            @Valid @RequestBody PushDto.BulkSendRequest request
    ) {
        pushService.sendPushBulk(request);
        return ResponseEntity.ok(ApiResponse.success("Push notification hàng loạt đang được gửi."));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Lấy danh sách lịch sử gửi Push với bộ lọc")
    public ResponseEntity<ApiResponse<Page<PushDto.Response>>> findAllHistory(
            @RequestParam(required = false) String deviceToken,
            @RequestParam(required = false) String status,
            Pageable pageable
    ) {
        Page<PushDto.Response> result = pushService.findAllHistory(deviceToken, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/history/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Chi tiết lịch sử gửi Push theo ID")
    public ResponseEntity<ApiResponse<PushDto.Response>> findHistoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(pushService.findHistoryById(id)));
    }
}
