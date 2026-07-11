package com.smartpark.domain.user.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.user.dto.UserDto;
import com.smartpark.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto.UserResponse>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUsers(search, role, status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> create(@RequestBody UserDto.UserCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.createUser(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> update(
            @PathVariable Long id,
            @RequestBody UserDto.UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUser(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Người dùng đã bị vô hiệu hóa thành công."));
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> assignRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String role = body.get("role");
        return ResponseEntity.ok(ApiResponse.success(userService.assignRoles(id, role)));
    }
}
