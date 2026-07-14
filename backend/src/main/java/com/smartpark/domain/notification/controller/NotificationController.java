package com.smartpark.domain.notification.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.notification.dto.NotificationDto;
import com.smartpark.domain.notification.service.NotificationService;
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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Center", description = "Quản lý và tra cứu thông báo hệ thống, thông báo cá nhân")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'CUSTOMER', 'EMPLOYEE')")
    @Operation(summary = "Lấy danh sách thông báo với bộ lọc nâng cao")
    public ResponseEntity<ApiResponse<Page<NotificationDto.Response>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable
    ) {
        Page<NotificationDto.Response> result = notificationService.findAll(
                search, type, priority, status, userId, customerId, employeeId, startDate, endDate, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'CUSTOMER', 'EMPLOYEE')")
    @Operation(summary = "Lấy chi tiết thông báo theo ID")
    public ResponseEntity<ApiResponse<NotificationDto.Response>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR')")
    @Operation(summary = "Tạo mới và gửi thông báo hệ thống")
    public ResponseEntity<ApiResponse<NotificationDto.Response>> create(
            @Valid @RequestBody NotificationDto.CreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(notificationService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Cập nhật thông tin thông báo")
    public ResponseEntity<ApiResponse<NotificationDto.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody NotificationDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Thông báo đã được cập nhật thành công.",
                notificationService.update(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Xóa thông báo (soft delete)")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Thông báo đã được xóa thành công."));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'CUSTOMER', 'EMPLOYEE')")
    @Operation(summary = "Đánh dấu thông báo đã đọc")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Thông báo đã được đánh dấu là đã đọc."));
    }

    @PatchMapping("/{id}/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'CUSTOMER', 'EMPLOYEE')")
    @Operation(summary = "Đánh dấu thông báo chưa đọc")
    public ResponseEntity<ApiResponse<String>> markAsUnread(@PathVariable Long id) {
        notificationService.markAsUnread(id);
        return ResponseEntity.ok(ApiResponse.success("Thông báo đã được đánh dấu là chưa đọc."));
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'CUSTOMER', 'EMPLOYEE')")
    @Operation(summary = "Đánh dấu tất cả thông báo của bạn là đã đọc")
    public ResponseEntity<ApiResponse<String>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("Tất cả thông báo đã được đánh dấu là đã đọc."));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'CUSTOMER', 'EMPLOYEE')")
    @Operation(summary = "Đếm số lượng thông báo chưa đọc của bạn")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount()));
    }
}
