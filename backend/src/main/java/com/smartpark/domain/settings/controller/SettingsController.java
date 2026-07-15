package com.smartpark.domain.settings.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.settings.dto.FeatureFlagDto;
import com.smartpark.domain.settings.dto.SecurityPolicyDto;
import com.smartpark.domain.settings.service.FeatureFlagService;
import com.smartpark.domain.settings.service.SecurityPolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Tag(name = "System Settings")
public class SettingsController {
    private final FeatureFlagService featureFlagService;
    private final SecurityPolicyService securityPolicyService;

    @GetMapping("/flags")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') and hasAuthority('SETTINGS_VIEW')")
    @Operation(summary = "Get runtime feature flags")
    public ResponseEntity<ApiResponse<FeatureFlagDto.Response>> getFlags() {
        return ResponseEntity.ok(ApiResponse.success(featureFlagService.get()));
    }

    @PutMapping("/flags")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') and hasAuthority('SETTINGS_UPDATE')")
    @Operation(summary = "Partially update runtime feature flags")
    public ResponseEntity<ApiResponse<FeatureFlagDto.Response>> updateFlags(
            @Valid @RequestBody FeatureFlagDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(featureFlagService.update(request)));
    }

    @GetMapping("/security")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') and hasAuthority('SETTINGS_VIEW')")
    @Operation(summary = "Get security policy", description = "Token lifetime changes apply to newly issued tokens; existing sessions remain valid.")
    public ResponseEntity<ApiResponse<SecurityPolicyDto.Response>> getSecurityPolicy() {
        return ResponseEntity.ok(ApiResponse.success(securityPolicyService.get()));
    }

    @PutMapping("/security")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') and hasAuthority('SETTINGS_UPDATE')")
    @Operation(summary = "Update security policy", description = "Password rules and login limits apply immediately. BCrypt strength and token lifetimes apply to newly created hashes and tokens.")
    public ResponseEntity<ApiResponse<SecurityPolicyDto.Response>> updateSecurityPolicy(
            @Valid @RequestBody SecurityPolicyDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(securityPolicyService.update(request)));
    }
}
