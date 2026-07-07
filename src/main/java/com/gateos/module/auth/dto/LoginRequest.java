package com.gateos.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    /**
     * Phân biệt đăng nhập Staff hay Customer.
     * Giá trị: "STAFF" hoặc "CUSTOMER" (mặc định "CUSTOMER")
     */
    private String userType = "CUSTOMER";
}
