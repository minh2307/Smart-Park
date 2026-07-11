package com.smartpark.domain.auth.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.auth.dto.AuthDto;
import com.smartpark.domain.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDto.TokenResponse>> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDto.UserResponse>> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDto.UserResponse>> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(authService.getMe(userDetails.getUsername())));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthDto.TokenResponse>> refreshToken(@Valid @RequestBody AuthDto.RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(request)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AuthDto.ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AuthDto.UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AuthDto.UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.updateProfile(userDetails.getUsername(), request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader(value = "Device-Id", required = false) String deviceId) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authService.logout(userDetails.getUsername(), authHeader.substring(7), deviceId);
        }
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
