package com.smartpark.domain.turnstile.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.turnstile.dto.TurnstileRequest;
import com.smartpark.domain.turnstile.dto.TurnstileResponse;
import com.smartpark.domain.turnstile.service.TurnstileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/turnstiles") @RequiredArgsConstructor
@Tag(name = "Turnstiles")
public class TurnstileController {
    private final TurnstileService service;
    @PostMapping
    @PreAuthorize("hasAuthority('GATE_CONTROL') or hasAuthority('DEVICE_TURNSTILE')")
    @Operation(summary = "Validate a turnstile ticket and return a fail-closed gate command")
    public ApiResponse<TurnstileResponse> scan(@Valid @RequestBody TurnstileRequest request) {
        return ApiResponse.success(service.process(request));
    }
}
