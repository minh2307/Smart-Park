package com.smartpark.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.smartpark.domain.auth.validation.ValidPassword;
import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;
        
        @NotBlank
        private String deviceId;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Size(min = 3, max = 100)
        private String username;
        @NotBlank @Email
        private String email;
        @NotBlank @ValidPassword
        private String password;
    }

    @Data
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
        
        @NotBlank
        private String deviceId;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank
        private String currentPassword;
        @NotBlank @ValidPassword
        private String newPassword;
    }

    @Data
    public static class TokenResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long userId;
        private String username;
        private String email;

        public TokenResponse(String accessToken, String refreshToken, Long userId, String username, String email) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.userId = userId;
            this.username = username;
            this.email = email;
        }
    }

    @Data
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String status;
        private String role;
        private String fullName;
        private java.util.List<String> permissions;
    }
}
