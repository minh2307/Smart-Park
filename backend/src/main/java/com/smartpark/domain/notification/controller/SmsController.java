package com.smartpark.domain.notification.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.notification.dto.SmsDto;
import com.smartpark.domain.notification.service.SmsService;
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
@RequestMapping("/api/v1/sms")
@RequiredArgsConstructor
@Tag(name = "SMS Sending & History", description = "API quản lý việc gửi tin nhắn SMS và tra cứu lịch sử gửi")
public class SmsController {

    private final SmsService smsService;

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Gửi SMS đơn lẻ")
    public ResponseEntity<ApiResponse<SmsDto.Response>> sendSms(
            @Valid @RequestBody SmsDto.SendRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(smsService.sendSms(request)));
    }

    @PostMapping("/send-bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Gửi SMS hàng loạt")
    public ResponseEntity<ApiResponse<String>> sendSmsBulk(
            @Valid @RequestBody SmsDto.BulkSendRequest request
    ) {
        smsService.sendSmsBulk(request);
        return ResponseEntity.ok(ApiResponse.success("SMS hàng loạt đang được gửi."));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Lấy danh sách lịch sử gửi SMS với bộ lọc")
    public ResponseEntity<ApiResponse<Page<SmsDto.Response>>> findAllHistory(
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String status,
            Pageable pageable
    ) {
        Page<SmsDto.Response> result = smsService.findAllHistory(phoneNumber, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/history/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Chi tiết lịch sử gửi SMS theo ID")
    public ResponseEntity<ApiResponse<SmsDto.Response>> findHistoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(smsService.findHistoryById(id)));
    }
}
