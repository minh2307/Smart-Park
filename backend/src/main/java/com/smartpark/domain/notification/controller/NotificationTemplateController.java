package com.smartpark.domain.notification.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.notification.dto.NotificationTemplateDto;
import com.smartpark.domain.notification.service.NotificationTemplateService;
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
@RequestMapping("/api/v1/notification-templates")
@RequiredArgsConstructor
@Tag(name = "Notification Templates", description = "API quản lý các mẫu thông báo dùng chung")
public class NotificationTemplateController {

    private final NotificationTemplateService templateService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR')")
    @Operation(summary = "Lấy danh sách mẫu thông báo với bộ lọc")
    public ResponseEntity<ApiResponse<Page<NotificationTemplateDto.Response>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String channel,
            @RequestParam(required = false) Boolean active,
            Pageable pageable
    ) {
        Page<NotificationTemplateDto.Response> result = templateService.findAll(search, channel, active, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR')")
    @Operation(summary = "Chi tiết mẫu thông báo theo ID")
    public ResponseEntity<ApiResponse<NotificationTemplateDto.Response>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(templateService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Tạo mới mẫu thông báo")
    public ResponseEntity<ApiResponse<NotificationTemplateDto.Response>> create(
            @Valid @RequestBody NotificationTemplateDto.CreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(templateService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin mẫu thông báo")
    public ResponseEntity<ApiResponse<NotificationTemplateDto.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody NotificationTemplateDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Mẫu thông báo đã được cập nhật thành công.",
                templateService.update(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Xóa mẫu thông báo")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        templateService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Mẫu thông báo đã được xóa thành công."));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Kích hoạt hoặc vô hiệu hóa mẫu thông báo")
    public ResponseEntity<ApiResponse<NotificationTemplateDto.Response>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Trạng thái kích hoạt đã được thay đổi.",
                templateService.toggleActive(id)
        ));
    }
}
