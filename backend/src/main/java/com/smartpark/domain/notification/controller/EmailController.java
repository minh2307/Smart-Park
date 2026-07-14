package com.smartpark.domain.notification.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.notification.dto.EmailDto;
import com.smartpark.domain.notification.service.EmailService;
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
@RequestMapping("/api/v1/email")
@RequiredArgsConstructor
@Tag(name = "Email Sending & History", description = "API quản lý việc gửi Email và tra cứu lịch sử gửi")
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Gửi email đơn lẻ")
    public ResponseEntity<ApiResponse<EmailDto.Response>> sendEmail(
            @Valid @RequestBody EmailDto.SendRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(emailService.sendEmail(request)));
    }

    @PostMapping("/send-bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Gửi email hàng loạt")
    public ResponseEntity<ApiResponse<String>> sendEmailBulk(
            @Valid @RequestBody EmailDto.BulkSendRequest request
    ) {
        emailService.sendEmailBulk(request);
        return ResponseEntity.ok(ApiResponse.success("Email hàng loạt đang được gửi."));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Lấy danh sách lịch sử gửi email với bộ lọc")
    public ResponseEntity<ApiResponse<Page<EmailDto.Response>>> findAllHistory(
            @RequestParam(required = false) String recipient,
            @RequestParam(required = false) String status,
            Pageable pageable
    ) {
        Page<EmailDto.Response> result = emailService.findAllHistory(recipient, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/history/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Chi tiết lịch sử gửi email theo ID")
    public ResponseEntity<ApiResponse<EmailDto.Response>> findHistoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(emailService.findHistoryById(id)));
    }

    @PostMapping("/retry")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Gửi lại các email bị lỗi")
    public ResponseEntity<ApiResponse<String>> retryFailedEmails() {
        emailService.retryFailedEmails();
        return ResponseEntity.ok(ApiResponse.success("Đang thực hiện gửi lại các email lỗi."));
    }
}
