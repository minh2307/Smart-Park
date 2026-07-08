package com.gateos.module.auth.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.module.auth.dto.LoginRequest;
import com.gateos.module.auth.dto.RegisterRequest;
import com.gateos.module.auth.dto.TokenResponse;
import com.gateos.module.auth.entity.Customer;
import com.gateos.module.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Đăng nhập, đăng ký, refresh token")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Đăng nhập (Customer hoặc Staff)")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response;
        String userType = request.getUserType();
        if (userType == null || userType.isBlank()) {
            if (authService.isStaffUser(request.getUsername())) {
                response = authService.loginStaff(request);
            } else {
                response = authService.loginCustomer(request);
            }
        } else if ("STAFF".equalsIgnoreCase(userType) || "ADMIN".equalsIgnoreCase(userType)) {
            response = authService.loginStaff(request);
        } else {
            response = authService.loginCustomer(request);
        }
        return ResponseEntity.ok(ApiResponse.ok(response, "Đăng nhập thành công"));
    }

    @Operation(summary = "Đăng ký tài khoản khách hàng")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        Customer customer = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        Map.of("id", customer.getId(), "username", customer.getUsername(), "email", customer.getEmail()),
                        "Đăng ký tài khoản thành công"
                ));
    }

    @Operation(summary = "Làm mới Access Token bằng Refresh Token")
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<TokenResponse>> refreshToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        TokenResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(response, "Làm mới token thành công"));
    }

    @Operation(summary = "Lấy thông tin tài khoản hiện tại")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMe(Authentication authentication) {
        if (authentication == null) {
            throw com.gateos.common.exception.BusinessException.unauthorized("Chưa đăng nhập hoặc token không hợp lệ", "ERR-AUTH-004");
        }
        return ResponseEntity.ok(ApiResponse.ok(
                Map.of("username", authentication.getName(), "roles", authentication.getAuthorities())
        ));
    }

}
