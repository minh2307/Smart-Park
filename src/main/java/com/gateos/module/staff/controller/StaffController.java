package com.gateos.module.staff.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.common.exception.BusinessException;
import com.gateos.module.auth.entity.Staff;
import com.gateos.module.auth.repository.StaffRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Staff Management", description = "Quản lý nhân sự và phân quyền")
public class StaffController {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Data
    static class StaffRequest {
        @NotNull private Long venueId;
        @NotBlank private String username;
        @NotBlank private String password;
        @NotBlank private String fullName;
        @Email private String email;
        @NotNull private Staff.StaffRole role;
    }

    @Operation(summary = "Danh sách nhân sự")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<Staff>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(staffRepository.findAll(PageRequest.of(page, size))));
    }

    @Operation(summary = "Tạo nhân sự mới")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Staff>> create(@Valid @RequestBody StaffRequest request) {
        if (staffRepository.existsByUsername(request.getUsername())) {
            throw BusinessException.conflict("Username đã được sử dụng", "ERR-STF-001");
        }
        Staff staff = Staff.builder()
                .venueId(request.getVenueId())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(request.getRole())
                .status(Staff.StaffStatus.ACTIVE)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(staffRepository.save(staff), "Tạo nhân sự thành công"));
    }

    @Operation(summary = "Cập nhật nhân sự")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Staff>> update(@PathVariable Long id, @Valid @RequestBody StaffRequest request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Nhân sự không tồn tại", "ERR-STF-002"));
        staff.setFullName(request.getFullName());
        staff.setEmail(request.getEmail());
        staff.setRole(request.getRole());
        staff.setVenueId(request.getVenueId());
        return ResponseEntity.ok(ApiResponse.ok(staffRepository.save(staff), "Cập nhật nhân sự thành công"));
    }

    @Operation(summary = "Vô hiệu hóa nhân sự")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Nhân sự không tồn tại", "ERR-STF-002"));
        staff.setStatus(Staff.StaffStatus.INACTIVE);
        staffRepository.save(staff);
        return ResponseEntity.ok(ApiResponse.success("Nhân sự đã bị vô hiệu hóa"));
    }
}
