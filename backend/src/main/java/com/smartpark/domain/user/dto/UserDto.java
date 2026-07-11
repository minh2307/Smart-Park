package com.smartpark.domain.user.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

public class UserDto {

    @Data
    public static class UserCreateRequest {
        private String username;
        private String password;
        private String email;
        private String fullName;
        private String phone;
        private String role;
        private String status;
    }

    @Data
    public static class UserUpdateRequest {
        private String email;
        private String fullName;
        private String phone;
        private String role;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private String status;
        private String avatarUrl;
        private LocalDateTime createdDate;
        private LocalDateTime lastUpdated;
        private List<String> permissions;
    }
}
