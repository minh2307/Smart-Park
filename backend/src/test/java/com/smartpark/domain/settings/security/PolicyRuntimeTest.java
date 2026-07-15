package com.smartpark.domain.settings.security;

import com.smartpark.domain.settings.dto.SecurityPolicyDto;
import com.smartpark.domain.settings.service.SecurityPolicyService;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PolicyRuntimeTest {
    @Test
    void encoderUsesCurrentStrengthAndStillMatchesExistingHashes() {
        SecurityPolicyService policies = mock(SecurityPolicyService.class);
        when(policies.get()).thenReturn(policy(10, 20, 3));
        PolicyAwarePasswordEncoder encoder = new PolicyAwarePasswordEncoder(policies);
        String encoded = encoder.encode("Password@123");
        assertTrue(encoded.startsWith("$2a$10$") || encoded.startsWith("$2b$10$") || encoded.startsWith("$2y$10$"));
        assertTrue(encoder.matches("Password@123", encoded));
    }

    @Test
    void jwtLifetimeComesFromCurrentPolicy() {
        SecurityPolicyService policies = mock(SecurityPolicyService.class);
        when(policies.get()).thenReturn(policy(12, 20, 3));
        JwtService jwt = new JwtService(policies);
        ReflectionTestUtils.setField(jwt, "jwtSecret", "Test-Secret-Key-Test-Secret-Key-Test-Secret-Key-Test-Secret-Key");
        String token = jwt.generateAccessToken(User.withUsername("admin").password("x").roles("SYSTEM_ADMIN").build());
        Date issued = jwt.extractClaim(token, claims -> claims.getIssuedAt());
        Date expires = jwt.extractClaim(token, claims -> claims.getExpiration());
        assertEquals(20 * 60L, (expires.getTime() - issued.getTime()) / 1000);
        assertEquals(3, jwt.currentRefreshTokenDays());
    }

    private SecurityPolicyDto.Response policy(int strength, int accessMinutes, int refreshDays) {
        return SecurityPolicyDto.Response.builder().bcryptStrength(strength).accessTokenMinutes(accessMinutes)
                .refreshTokenDays(refreshDays).passwordMinLength(8).passwordRequireUppercase(true)
                .passwordRequireLowercase(true).passwordRequireNumber(true)
                .passwordRequireSpecialCharacter(true).build();
    }
}
