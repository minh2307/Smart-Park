package com.smartpark.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.auth.dto.AuthDto;
import com.smartpark.domain.auth.entity.Role;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private JwtService jwtService;

    private String adminToken;
    private String customerToken;

    private String generateExpiredToken(String username) {
        String secret = "Test-Secret-Key-Test-Secret-Key-Test-Secret-Key-Test-Secret-Key";
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis() - 20000))
                .expiration(new Date(System.currentTimeMillis() - 10000))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes()))
                .compact();
    }

    @BeforeEach
    void setup() {
        userRepository.deleteAll();
        redisTemplate.getConnectionFactory().getConnection().serverCommands().flushAll();

        User user = User.builder()
                .username("testuser")
                .passwordHash(passwordEncoder.encode("password123"))
                .email("test@smartpark.com")
                .status(User.UserStatus.ACTIVE)
                .build();
        userRepository.save(user);

        User admin = User.builder()
                .username("adminuser")
                .passwordHash(passwordEncoder.encode("password123"))
                .email("admin@smartpark.com")
                .status(User.UserStatus.ACTIVE)
                .build();
        userRepository.save(admin);

        org.springframework.security.core.userdetails.User springUser = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPasswordHash(), List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        customerToken = jwtService.generateAccessToken(springUser);

        org.springframework.security.core.userdetails.User springAdmin = new org.springframework.security.core.userdetails.User(
                admin.getUsername(), admin.getPasswordHash(), List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        adminToken = jwtService.generateAccessToken(springAdmin);
    }

    @Test
    void testLoginSuccess_AndLogout() throws Exception {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest();
        req.setUsername("testuser");
        req.setPassword("password123");
        req.setDeviceId("device1");

        String responseStr = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(responseStr).get("data").get("accessToken").asText();

        // Access protected resource
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("testuser"));

        // Logout
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Access again -> Should be 401 Unauthorized because it's blacklisted
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testBruteForceProtection() throws Exception {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest();
        req.setUsername("testuser");
        req.setPassword("wrongpassword");
        req.setDeviceId("device1");

        // Fail 5 times
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt even with correct password should fail because account is locked
        req.setPassword("password123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest()) // mapped from BusinessException ERR-AUTH-001 (400)
                .andExpect(jsonPath("$.message").value("Tài khoản đang bị khóa. Vui lòng thử lại sau."));
    }

    @Test
    void testRateLimiting() throws Exception {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest();
        req.setUsername("testuser");
        req.setPassword("password123");
        req.setDeviceId("device1");

        // Bucket4j allows 10 requests per minute
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk());
        }

        // 11th request should hit 429 Too Many Requests
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void testNoJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testInvalidJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testExpiredJwt_Returns401() throws Exception {
        String expiredToken = generateExpiredToken("testuser");
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testCustomerAccessAdminApi_Returns403() throws Exception {
        mockMvc.perform(post("/api/v1/payments/refunds/1/approve")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminAccessRefund_Returns404Or200() throws Exception {
        // Here we just test authorization, it might return 404 if payment 999 doesn't exist,
        // but it should NOT return 401 or 403.
        mockMvc.perform(post("/api/v1/payments/refunds/999/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound()); // The endpoint requires ADMIN, if 404, it means it passed authorization.
    }
}
