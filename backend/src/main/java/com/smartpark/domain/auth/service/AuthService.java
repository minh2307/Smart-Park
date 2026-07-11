package com.smartpark.domain.auth.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.dto.AuthDto;
import com.smartpark.domain.auth.entity.SecurityAuditLog;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StringRedisTemplate redisTemplate;
    private final SecurityAuditService securityAuditService;
    private final UserDetailsService userDetailsService;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_TIME_DURATION = 15; // minutes

    @Transactional(noRollbackFor = BadCredentialsException.class)
    public AuthDto.TokenResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByUsernameWithRoles(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không đúng."));

        if (user.getStatus() == User.UserStatus.DISABLED) {
            throw new BusinessException("ERR-AUTH-001", "Tài khoản đã bị vô hiệu hóa.");
        }

        if (user.getStatus() == User.UserStatus.LOCKED || 
            (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now()))) {
            throw new BusinessException("ERR-AUTH-001", "Tài khoản đang bị khóa. Vui lòng thử lại sau.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int newFailures = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(newFailures);
            if (newFailures >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_TIME_DURATION));
                user.setStatus(User.UserStatus.LOCKED);
            }
            userRepository.save(user);
            securityAuditService.logAudit(user.getId(), "LOGIN_FAILED");
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không đúng.");
        }

        // Successful login
        if (user.getFailedLoginAttempts() > 0 || user.getStatus() == User.UserStatus.LOCKED) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            user.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(user);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        
        // Store refresh token in Redis (7 days TTL)
        redisTemplate.opsForValue().set("RT:" + user.getId() + ":" + request.getDeviceId(), refreshToken, 7, TimeUnit.DAYS);

        securityAuditService.logAudit(user.getId(), "LOGIN_SUCCESS");
        log.info("[USER LOGIN] username={}", user.getUsername());
        return new AuthDto.TokenResponse(accessToken, refreshToken, user.getId(), user.getUsername(), user.getEmail());
    }

    @Transactional
    public AuthDto.UserResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("ERR-AUTH-002", "Tên đăng nhập '" + request.getUsername() + "' đã tồn tại.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("ERR-AUTH-003", "Email '" + request.getEmail() + "' đã được sử dụng.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(User.UserStatus.ACTIVE)
                .build();

        User saved = userRepository.save(user);
        
        log.info("[USER REGISTERED] username={}", saved.getUsername());

        AuthDto.UserResponse response = new AuthDto.UserResponse();
        response.setId(saved.getId());
        response.setUsername(saved.getUsername());
        response.setEmail(saved.getEmail());
        response.setStatus(saved.getStatus().name());
        response.setRole("CUSTOMER");
        response.setFullName(saved.getUsername());
        response.setPermissions(java.util.Collections.emptyList());
        return response;
    }

    @Transactional(readOnly = true)
    public AuthDto.UserResponse getMe(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        
        AuthDto.UserResponse response = new AuthDto.UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setStatus(user.getStatus().name());
        
        // Map role code to frontend expectation
        String mappedRole = "CUSTOMER";
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            String dbRole = user.getRoles().iterator().next().getCode();
            if ("SYSTEM_ADMIN".equals(dbRole)) {
                mappedRole = "ADMIN";
            } else if ("QUAN_LY".equals(dbRole)) {
                mappedRole = "MANAGER";
            } else if ("NHAN_VIEN".equals(dbRole)) {
                mappedRole = "NHAN_VIEN";
            }
        }
        response.setRole(mappedRole);
        
        // Set a friendly display full name
        String fullName = user.getUsername();
        if ("sys_admin".equals(fullName)) {
            fullName = "Nguyen Son Minh (Admin)";
        } else {
            fullName = fullName.substring(0, 1).toUpperCase() + fullName.substring(1);
        }
        response.setFullName(fullName);
        
        // Collect permission codes
        java.util.List<String> permissionsList = java.util.Collections.emptyList();
        if (user.getRoles() != null) {
            permissionsList = user.getRoles().stream()
                    .filter(role -> role.getPermissions() != null)
                    .flatMap(role -> role.getPermissions().stream().map(com.smartpark.domain.auth.entity.Permission::getCode))
                    .distinct()
                    .collect(java.util.stream.Collectors.toList());
        }
        response.setPermissions(permissionsList);
        
        return response;
    }

    @Transactional
    public AuthDto.TokenResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        String username;
        try {
            username = jwtService.extractUsername(token);
            String type = jwtService.extractClaim(token, claims -> claims.get("type", String.class));
            if (!"refresh".equals(type)) {
                throw new BusinessException("ERR-AUTH-004", "Token không phải là refresh token hợp lệ.");
            }
        } catch (Exception e) {
            throw new BusinessException("ERR-AUTH-005", "Refresh token không hợp lệ hoặc đã hết hạn.");
        }

        User user = userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new BusinessException("ERR-AUTH-006", "Tài khoản không hoạt động.");
        }

        // Check if token exists in Redis
        String savedToken = redisTemplate.opsForValue().get("RT:" + user.getId() + ":" + request.getDeviceId());
        if (savedToken == null || !savedToken.equals(token)) {
            throw new BusinessException("ERR-AUTH-007", "Refresh token đã bị thu hồi hoặc không hợp lệ.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

        if (!jwtService.isTokenValid(token, userDetails)) {
            throw new BusinessException("ERR-AUTH-007", "Refresh token không hợp lệ.");
        }

        String newAccessToken = jwtService.generateAccessToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);
        
        // Rotate
        redisTemplate.opsForValue().set("RT:" + user.getId() + ":" + request.getDeviceId(), newRefreshToken, 7, TimeUnit.DAYS);

        log.info("[TOKEN REFRESHED] username={}", username);
        return new AuthDto.TokenResponse(newAccessToken, newRefreshToken, user.getId(), user.getUsername(), user.getEmail());
    }

    @Transactional
    public void logout(String username, String accessToken, String deviceId) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            // Delete refresh token for this device
            if (deviceId != null) {
                redisTemplate.delete("RT:" + user.getId() + ":" + deviceId);
            }
            // Blacklist access token with remaining TTL
            long remainingTime = jwtService.getRemainingTimeInSeconds(accessToken);
            if (remainingTime > 0) {
                redisTemplate.opsForValue().set("BL:" + accessToken, "blacklisted", remainingTime, TimeUnit.SECONDS);
            }
            securityAuditService.logAudit(user.getId(), "LOGOUT");
            log.info("[USER LOGOUT] username={}, deviceId={}", username, deviceId);
        }
    }

    @Transactional
    public void changePassword(String username, AuthDto.ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("ERR-AUTH-008", "Mật khẩu hiện tại không đúng.");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BusinessException("ERR-AUTH-009", "Mật khẩu mới phải khác mật khẩu hiện tại.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Revoke tokens on password change (delete all devices)
        java.util.Set<String> keys = redisTemplate.keys("RT:" + user.getId() + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }

        securityAuditService.logAudit(user.getId(), "PASSWORD_CHANGE");
        log.info("[PASSWORD CHANGED] username={}", username);
    }

}
