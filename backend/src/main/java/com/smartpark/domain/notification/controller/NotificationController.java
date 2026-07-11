package com.smartpark.domain.notification.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.notification.entity.Notification;
import com.smartpark.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.findAll(pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Notification>> create(@RequestBody Notification notification) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.create(notification)));
    }
}
