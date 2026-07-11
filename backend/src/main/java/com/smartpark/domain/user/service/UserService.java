package com.smartpark.domain.user.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.entity.Role;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.RoleRepository;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.employee.entity.Employee;
import com.smartpark.domain.employee.repository.EmployeeRepository;
import com.smartpark.domain.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserDto.UserResponse> getUsers(String search, String role, String status, Pageable pageable) {
        List<User> allUsers = userRepository.findAll();
        List<UserDto.UserResponse> responses = new ArrayList<>();

        for (User u : allUsers) {
            // Role mapping
            String mappedRole = "CUSTOMER";
            if (u.getRoles() != null && !u.getRoles().isEmpty()) {
                String dbRole = u.getRoles().iterator().next().getCode();
                if ("SYSTEM_ADMIN".equals(dbRole)) {
                    mappedRole = "ADMIN";
                } else if ("QUAN_LY".equals(dbRole) || "PARK_MANAGER".equals(dbRole) || "GATE_STAFF".equals(dbRole)) {
                    mappedRole = "NHAN_VIEN";
                }
            }

            // Employee fields
            String fullName = "";
            String phone = "";
            Optional<Employee> empOpt = employeeRepository.findByUserId(u.getId());
            if (empOpt.isPresent()) {
                fullName = empOpt.get().getFullName();
                phone = empOpt.get().getPhone();
            }

            if (fullName == null || fullName.trim().isEmpty()) {
                fullName = u.getUsername();
            }

            // Filter status
            String mappedStatus = u.getStatus().name();
            if ("DISABLED".equals(mappedStatus)) {
                mappedStatus = "INACTIVE";
            }

            // Apply Filters
            if (status != null && !status.isEmpty()) {
                if (!status.equalsIgnoreCase(mappedStatus)) {
                    continue;
                }
            }

            if (role != null && !role.isEmpty()) {
                if (!role.equalsIgnoreCase(mappedRole)) {
                    continue;
                }
            }

            if (search != null && !search.isEmpty()) {
                String term = search.toLowerCase();
                boolean matches = u.getUsername().toLowerCase().contains(term) ||
                                  u.getEmail().toLowerCase().contains(term) ||
                                  fullName.toLowerCase().contains(term) ||
                                  (phone != null && phone.contains(term));
                if (!matches) {
                    continue;
                }
            }

            // Permissions list
            List<String> permissions = Collections.emptyList();
            if (u.getRoles() != null) {
                permissions = u.getRoles().stream()
                        .filter(r -> r.getPermissions() != null)
                        .flatMap(r -> r.getPermissions().stream().map(p -> p.getCode()))
                        .distinct()
                        .collect(Collectors.toList());
            }

            responses.add(UserDto.UserResponse.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .fullName(fullName)
                    .phone(phone)
                    .role(mappedRole)
                    .status(mappedStatus)
                    .avatarUrl(u.getAvatarUrl())
                    .createdDate(u.getCreatedAt())
                    .lastUpdated(u.getUpdatedAt())
                    .permissions(permissions)
                    .build());
        }

        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());
        List<UserDto.UserResponse> subList = start < responses.size() ? responses.subList(start, end) : Collections.emptyList();

        return new PageImpl<>(subList, pageable, responses.size());
    }

    @Transactional(readOnly = true)
    public UserDto.UserResponse getUserById(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return convertToResponse(u);
    }

    @Transactional
    public UserDto.UserResponse createUser(UserDto.UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("ERR-USER-001", "Tên đăng nhập đã tồn tại.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("ERR-USER-002", "Email đã tồn tại.");
        }

        // Map Role
        String roleCode = "CUSTOMER";
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            roleCode = "SYSTEM_ADMIN";
        } else if ("NHAN_VIEN".equalsIgnoreCase(request.getRole())) {
            roleCode = "GATE_STAFF";
        }

        final String finalRoleCode = roleCode;
        Role role = roleRepository.findByCode(finalRoleCode)
                .orElseThrow(() -> new ResourceNotFoundException("Role", finalRoleCode));

        User.UserStatus userStatus = User.UserStatus.ACTIVE;
        if ("INACTIVE".equalsIgnoreCase(request.getStatus())) {
            userStatus = User.UserStatus.DISABLED;
        } else if ("LOCKED".equalsIgnoreCase(request.getStatus())) {
            userStatus = User.UserStatus.LOCKED;
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(userStatus)
                .roles(Set.of(role))
                .build();

        User savedUser = userRepository.save(user);

        // If ADMIN or NHAN_VIEN, create employee record
        if ("SYSTEM_ADMIN".equals(roleCode) || "GATE_STAFF".equals(roleCode)) {
            Employee employee = Employee.builder()
                    .userId(savedUser.getId())
                    .fullName(request.getFullName())
                    .phone(request.getPhone())
                    .email(request.getEmail())
                    .status(Employee.EmployeeStatus.ACTIVE)
                    .build();
            employeeRepository.save(employee);
        }

        return convertToResponse(savedUser);
    }

    @Transactional
    public UserDto.UserResponse updateUser(Long id, UserDto.UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("ERR-USER-002", "Email đã được sử dụng bởi tài khoản khác.");
        }

        user.setEmail(request.getEmail());

        User.UserStatus userStatus = User.UserStatus.ACTIVE;
        if ("INACTIVE".equalsIgnoreCase(request.getStatus())) {
            userStatus = User.UserStatus.DISABLED;
        } else if ("LOCKED".equalsIgnoreCase(request.getStatus())) {
            userStatus = User.UserStatus.LOCKED;
        }
        user.setStatus(userStatus);

        // Update Role if changed
        String roleCode = "CUSTOMER";
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            roleCode = "SYSTEM_ADMIN";
        } else if ("NHAN_VIEN".equalsIgnoreCase(request.getRole())) {
            roleCode = "GATE_STAFF";
        }

        final String finalRoleCode = roleCode;
        Role role = roleRepository.findByCode(finalRoleCode)
                .orElseThrow(() -> new ResourceNotFoundException("Role", finalRoleCode));
        user.setRoles(Set.of(role));

        userRepository.save(user);

        // Update Employee record
        Optional<Employee> empOpt = employeeRepository.findByUserId(id);
        if (empOpt.isPresent()) {
            Employee employee = empOpt.get();
            employee.setFullName(request.getFullName());
            employee.setPhone(request.getPhone());
            employee.setEmail(request.getEmail());
            employeeRepository.save(employee);
        } else if ("SYSTEM_ADMIN".equals(roleCode) || "GATE_STAFF".equals(roleCode)) {
            Employee employee = Employee.builder()
                    .userId(id)
                    .fullName(request.getFullName())
                    .phone(request.getPhone())
                    .email(request.getEmail())
                    .status(Employee.EmployeeStatus.ACTIVE)
                    .build();
            employeeRepository.save(employee);
        }

        return convertToResponse(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setStatus(User.UserStatus.DISABLED);
        userRepository.save(user);

        employeeRepository.findByUserId(id).ifPresent(emp -> {
            emp.setStatus(Employee.EmployeeStatus.INACTIVE);
            employeeRepository.save(emp);
        });
    }

    @Transactional
    public UserDto.UserResponse assignRoles(Long id, String roleName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        String roleCode = "CUSTOMER";
        if ("ADMIN".equalsIgnoreCase(roleName)) {
            roleCode = "SYSTEM_ADMIN";
        } else if ("NHAN_VIEN".equalsIgnoreCase(roleName)) {
            roleCode = "GATE_STAFF";
        }

        final String finalRoleCode = roleCode;
        Role role = roleRepository.findByCode(finalRoleCode)
                .orElseThrow(() -> new ResourceNotFoundException("Role", finalRoleCode));
        user.setRoles(Set.of(role));
        userRepository.save(user);

        return convertToResponse(user);
    }

    private UserDto.UserResponse convertToResponse(User u) {
        String mappedRole = "CUSTOMER";
        if (u.getRoles() != null && !u.getRoles().isEmpty()) {
            String dbRole = u.getRoles().iterator().next().getCode();
            if ("SYSTEM_ADMIN".equals(dbRole)) {
                mappedRole = "ADMIN";
            } else if ("QUAN_LY".equals(dbRole) || "PARK_MANAGER".equals(dbRole) || "GATE_STAFF".equals(dbRole)) {
                mappedRole = "NHAN_VIEN";
            }
        }

        String fullName = "";
        String phone = "";
        Optional<Employee> empOpt = employeeRepository.findByUserId(u.getId());
        if (empOpt.isPresent()) {
            fullName = empOpt.get().getFullName();
            phone = empOpt.get().getPhone();
        }

        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = u.getUsername();
        }

        String mappedStatus = u.getStatus().name();
        if ("DISABLED".equals(mappedStatus)) {
            mappedStatus = "INACTIVE";
        }

        List<String> permissions = Collections.emptyList();
        if (u.getRoles() != null) {
            permissions = u.getRoles().stream()
                    .filter(r -> r.getPermissions() != null)
                    .flatMap(r -> r.getPermissions().stream().map(p -> p.getCode()))
                    .distinct()
                    .collect(Collectors.toList());
        }

        return UserDto.UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(fullName)
                .phone(phone)
                .role(mappedRole)
                .status(mappedStatus)
                .avatarUrl(u.getAvatarUrl())
                .createdDate(u.getCreatedAt())
                .lastUpdated(u.getUpdatedAt())
                .permissions(permissions)
                .build();
    }
}
