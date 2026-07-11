package com.smartpark.domain.audit.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.audit.entity.AuditLog;
import com.smartpark.domain.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLog>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.findAll(pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AuditLog>> create(@RequestBody AuditLog auditLog) {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.create(auditLog)));
    }
}
