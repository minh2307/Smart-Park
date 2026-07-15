package com.smartpark.domain.auth.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.dto.AuthDto;
import com.smartpark.domain.auth.entity.SecurityAuditLog;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.settings.dto.SecurityPolicyDto;
import com.smartpark.domain.settings.service.SecurityPolicyService;
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
    private final SecurityPolicyService securityPolicyService;
    private final com.smartpark.domain.employee.repository.EmployeeRepository employeeRepository;
    private final com.smartpark.domain.customer.repository.CustomerRepository customerRepository;
    private final com.smartpark.domain.membership.repository.MembershipRepository membershipRepository;
    private final com.smartpark.domain.membership.repository.MembershipTierRepository membershipTierRepository;

    @Transactional(noRollbackFor = BadCredentialsException.class)
    public AuthDto.TokenResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByUsernameWithRoles(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không đúng."));
        SecurityPolicyDto.Response securityPolicy = securityPolicyService.get();

        if (user.getStatus() == User.UserStatus.DISABLED) {
            throw new BusinessException("ERR-AUTH-001", "Tài khoản đã bị vô hiệu hóa.");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new BusinessException("ERR-AUTH-001", "Tài khoản đang bị khóa. Vui lòng thử lại sau.");
        }
        if (user.getStatus() == User.UserStatus.LOCKED) {
            if (user.getLockedUntil() == null) {
                throw new BusinessException("ERR-AUTH-001", "Tài khoản đang bị khóa. Vui lòng thử lại sau.");
            }
            user.setStatus(User.UserStatus.ACTIVE);
            user.setLockedUntil(null);
            user.setFailedLoginAttempts(0);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int newFailures = recordFailedAttempt(user, securityPolicy);
            user.setFailedLoginAttempts(newFailures);
            if (newFailures >= securityPolicy.getMaxLoginAttempts()) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(securityPolicy.getAccountLockMinutes()));
                user.setStatus(User.UserStatus.LOCKED);
            }
            userRepository.saveAndFlush(user);
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
        deleteLoginAttemptCounter(user.getId());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        
        // Store refresh token in Redis (7 days TTL)
        redisTemplate.opsForValue().set("RT:" + user.getId() + ":" + request.getDeviceId(), refreshToken,
                jwtService.currentRefreshTokenDays(), TimeUnit.DAYS);

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
        
        // Auto-create Customer profile for new CUSTOMER users (enables membership/order lookups)
        com.smartpark.domain.customer.entity.Customer customer = com.smartpark.domain.customer.entity.Customer.builder()
                .userId(saved.getId())
                .fullName(request.getUsername())
                .status(com.smartpark.domain.customer.entity.Customer.CustomerStatus.ACTIVE)
                .build();
        com.smartpark.domain.customer.entity.Customer savedCustomer = customerRepository.save(customer);

        // Auto-assign default (Bronze) membership tier
        var defaultTier = membershipTierRepository.findAll().stream()
                .filter(t -> t.getMinSpend() != null)
                .min(java.util.Comparator.comparing(t -> t.getMinSpend()))
                .orElse(null);
        if (defaultTier != null) {
            String membershipCode = "MBR-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            com.smartpark.domain.membership.entity.Membership membership = com.smartpark.domain.membership.entity.Membership.builder()
                    .customer(savedCustomer)
                    .tier(defaultTier)
                    .membershipCode(membershipCode)
                    .points(0L)
                    .joinDate(java.time.LocalDate.now())
                    .status(com.smartpark.domain.membership.entity.Membership.MembershipStatus.ACTIVE)
                    .build();
            membershipRepository.save(membership);
            log.info("[MEMBERSHIP AUTO-CREATED] customerId={} code={}", savedCustomer.getId(), membershipCode);
        }

        log.info("[USER REGISTERED] username={}", saved.getUsername());

        AuthDto.UserResponse response = new AuthDto.UserResponse();
        response.setId(saved.getId());
        response.setUsername(saved.getUsername());
        response.setEmail(saved.getEmail());
        response.setStatus(saved.getStatus().name());
        response.setRole("CUSTOMER");
        response.setFullName(saved.getUsername());
        response.setAvatarUrl(saved.getAvatarUrl());
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
        response.setAvatarUrl(user.getAvatarUrl());
        
        // Map role code to frontend expectation
        String mappedRole = "CUSTOMER";
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            String dbRole = user.getRoles().iterator().next().getCode();
            if ("SYSTEM_ADMIN".equals(dbRole) || "ADMIN".equals(dbRole)) {
                mappedRole = "SYSTEM_ADMIN";
            } else if ("PARK_MANAGER".equals(dbRole) || "QUAN_LY".equals(dbRole) || "MANAGER".equals(dbRole)) {
                mappedRole = "PARK_MANAGER";
            } else if ("GATE_STAFF".equals(dbRole) || "NHAN_VIEN".equals(dbRole)) {
                mappedRole = "OPERATIONS_STAFF";
            } else {
                mappedRole = dbRole;
            }
        }
        response.setRole(mappedRole);
        
        // Try to fetch full name from employees table
        String fullName = null;
        var empOpt = employeeRepository.findByUserId(user.getId());
        if (empOpt.isPresent()) {
            fullName = empOpt.get().getFullName();
        }
        
        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = user.getUsername();
            if ("sys_admin".equals(fullName)) {
                fullName = "Nguyen Son Minh (Admin)";
            } else {
                fullName = fullName.substring(0, 1).toUpperCase() + fullName.substring(1);
            }
        }
        response.setFullName(fullName);
        
        // Populate customerId and phone from Customer record
        var customerOpt = customerRepository.findByUserId(user.getId());
        if (customerOpt.isPresent()) {
            response.setCustomerId(customerOpt.get().getId());
            response.setPhone(customerOpt.get().getPhone());
        }
        
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
        redisTemplate.opsForValue().set("RT:" + user.getId() + ":" + request.getDeviceId(), newRefreshToken,
                jwtService.currentRefreshTokenDays(), TimeUnit.DAYS);

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

    @Transactional
    public AuthDto.UserResponse updateProfile(String username, AuthDto.UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("ERR-USER-002", "Email đã được sử dụng bởi tài khoản khác.");
        }

        user.setEmail(request.getEmail());
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        userRepository.save(user);

        // Update corresponding employee record if exists
        var empOpt = employeeRepository.findByUserId(user.getId());
        if (empOpt.isPresent()) {
            var employee = empOpt.get();
            employee.setFullName(request.getFullName());
            employee.setPhone(request.getPhone());
            employee.setEmail(request.getEmail());
            employeeRepository.save(employee);
        }

        // Also update Customer profile (for CUSTOMER role users)
        var customerOpt = customerRepository.findByUserId(user.getId());
        if (customerOpt.isPresent()) {
            var cust = customerOpt.get();
            if (request.getFullName() != null) cust.setFullName(request.getFullName());
            if (request.getPhone() != null) cust.setPhone(request.getPhone());
            customerRepository.save(cust);
        }

        return getMe(username);
    }

    private int recordFailedAttempt(User user, SecurityPolicyDto.Response policy) {
        String key = "LOGIN_FAIL:" + user.getId();
        try {
            Long failures = redisTemplate.opsForValue().increment(key);
            if (failures != null && failures == 1) {
                redisTemplate.expire(key, policy.getLoginAttemptWindowMinutes(), TimeUnit.MINUTES);
            }
            return failures == null ? user.getFailedLoginAttempts() + 1 : Math.toIntExact(failures);
        } catch (RuntimeException ex) {
            log.warn("Login attempt counter unavailable; using database counter: {}", ex.getMessage());
            return user.getFailedLoginAttempts() + 1;
        }
    }

    private void deleteLoginAttemptCounter(Long userId) {
        try { redisTemplate.delete("LOGIN_FAIL:" + userId); }
        catch (RuntimeException ex) { log.warn("Could not clear login attempt counter: {}", ex.getMessage()); }
    }

}
