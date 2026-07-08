package com.gateos.module.auth.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.auth.dto.LoginRequest;
import com.gateos.module.auth.dto.RegisterRequest;
import com.gateos.module.auth.dto.TokenResponse;
import com.gateos.module.auth.entity.Customer;
import com.gateos.module.auth.entity.Staff;
import com.gateos.module.auth.repository.CustomerRepository;
import com.gateos.module.auth.repository.StaffRepository;
import com.gateos.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;

    // =================== CUSTOMER AUTH ===================

    @Transactional
    public TokenResponse loginCustomer(LoginRequest request) {
        Customer customer = customerRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> BusinessException.unauthorized(
                        "Email hoặc mật khẩu không chính xác", "ERR-AUTH-001"));

        // Check lock
        if (customer.getLockedUntil() != null && customer.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw BusinessException.unauthorized(
                    "Tài khoản đã bị khóa tạm thời 30 phút do đăng nhập sai quá nhiều lần", "ERR-AUTH-002");
        }

        if (customer.getStatus() == Customer.CustomerStatus.INACTIVE) {
            throw BusinessException.unauthorized("Tài khoản đã bị vô hiệu hóa", "ERR-AUTH-002");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            handleFailedLogin(customer);
            int remaining = MAX_FAILED_ATTEMPTS - customer.getFailedLoginAttempts();
            throw BusinessException.unauthorized(
                    "Email hoặc mật khẩu không chính xác. Bạn còn " + Math.max(remaining, 0) + " lần thử",
                    "ERR-AUTH-001");
        }

        // Reset failed attempts on success
        customer.setFailedLoginAttempts(0);
        customer.setLockedUntil(null);
        customerRepository.save(customer);

        UserDetails userDetails = buildCustomerUserDetails(customer);
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiration / 1000)
                .roles(List.of("ROLE_CUSTOMER"))
                .user(TokenResponse.UserInfo.builder()
                        .id(customer.getId())
                        .username(customer.getUsername())
                        .fullName(customer.getFullName())
                        .email(customer.getEmail())
                        .userType("CUSTOMER")
                        .build())
                .build();
    }

    @Transactional
    public TokenResponse loginStaff(LoginRequest request) {
        Staff staff = staffRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> BusinessException.unauthorized(
                        "Email hoặc mật khẩu không chính xác", "ERR-AUTH-001"));

        if (staff.getLockedUntil() != null && staff.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw BusinessException.unauthorized(
                    "Tài khoản đã bị khóa tạm thời 30 phút do đăng nhập sai quá nhiều lần", "ERR-AUTH-002");
        }

        if (staff.getStatus() == Staff.StaffStatus.INACTIVE) {
            throw BusinessException.unauthorized("Tài khoản đã bị vô hiệu hóa", "ERR-AUTH-002");
        }

        if (!passwordEncoder.matches(request.getPassword(), staff.getPassword())) {
            handleFailedLoginStaff(staff);
            int remaining = MAX_FAILED_ATTEMPTS - staff.getFailedLoginAttempts();
            throw BusinessException.unauthorized(
                    "Email hoặc mật khẩu không chính xác. Bạn còn " + Math.max(remaining, 0) + " lần thử",
                    "ERR-AUTH-001");
        }

        staff.setFailedLoginAttempts(0);
        staff.setLockedUntil(null);
        staffRepository.save(staff);

        UserDetails userDetails = buildStaffUserDetails(staff);
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiration / 1000)
                .roles(List.of("ROLE_" + staff.getRole().name()))
                .user(TokenResponse.UserInfo.builder()
                        .id(staff.getId())
                        .username(staff.getUsername())
                        .fullName(staff.getFullName())
                        .email(staff.getEmail())
                        .userType(staff.getRole() == Staff.StaffRole.ADMIN ? "ADMIN" : "STAFF")
                        .build())
                .build();
    }

    @Transactional
    public Customer register(RegisterRequest request) {
        if (customerRepository.existsByUsername(request.getUsername())) {
            throw BusinessException.conflict("Username đã được sử dụng", "ERR-AUTH-005");
        }
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw BusinessException.conflict("Email đã được đăng ký", "ERR-AUTH-006");
        }

        Customer customer = Customer.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .status(Customer.CustomerStatus.ACTIVE)
                .build();

        return customerRepository.save(customer);
    }

    public TokenResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken) || !jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw BusinessException.unauthorized("Refresh token không hợp lệ hoặc đã hết hạn", "ERR-AUTH-003");
        }

        String username = jwtTokenProvider.extractUsername(refreshToken);
        List<String> roles = jwtTokenProvider.extractRoles(refreshToken);

        // Rebuild UserDetails from token roles
        List<SimpleGrantedAuthority> authorities = (roles == null ? List.<String>of() : roles)
                .stream().map(SimpleGrantedAuthority::new).toList();
        UserDetails userDetails = new User(username, "", authorities);

        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiration / 1000)
                .roles(roles)
                .build();
    }

    // =================== HELPERS ===================

    private void handleFailedLogin(Customer customer) {
        int attempts = customer.getFailedLoginAttempts() + 1;
        customer.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            customer.setStatus(Customer.CustomerStatus.LOCKED);
            customer.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            log.warn("Customer account locked: {}", customer.getUsername());
        }
        customerRepository.save(customer);
    }

    private void handleFailedLoginStaff(Staff staff) {
        int attempts = staff.getFailedLoginAttempts() + 1;
        staff.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            staff.setStatus(Staff.StaffStatus.LOCKED);
            staff.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            log.warn("Staff account locked: {}", staff.getUsername());
        }
        staffRepository.save(staff);
    }

    private UserDetails buildCustomerUserDetails(Customer customer) {
        return User.builder()
                .username(customer.getUsername())
                .password(customer.getPassword())
                .authorities("ROLE_CUSTOMER")
                .build();
    }

    private UserDetails buildStaffUserDetails(Staff staff) {
        return User.builder()
                .username(staff.getUsername())
                .password(staff.getPassword())
                .authorities("ROLE_" + staff.getRole().name())
                .build();
    }

    public boolean isStaffUser(String username) {
        return staffRepository.existsByUsername(username);
    }
}

