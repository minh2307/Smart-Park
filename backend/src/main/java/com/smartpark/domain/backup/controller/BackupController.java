package com.smartpark.domain.backup.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.backup.dto.BackupDto;
import com.smartpark.domain.backup.service.BackupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings/backup")
@RequiredArgsConstructor
@Tag(name = "System Backup")
public class BackupController {
    private final BackupService service;

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') and hasAuthority('SETTINGS_UPDATE')")
    @Operation(summary = "Queue a controlled backup job")
    public ResponseEntity<ApiResponse<BackupDto.Response>> trigger(@Valid @RequestBody BackupDto.Request request) {
        BackupDto.Response response = service.trigger(request);
        return ResponseEntity.accepted().body(ApiResponse.<BackupDto.Response>builder()
                .status(202).message("Backup queued").data(response).build());
    }
}
