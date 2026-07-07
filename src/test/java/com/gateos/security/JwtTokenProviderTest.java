package com.gateos.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "mySecretKeyForTestingJwtAuthenticationWithAtLeast256Bits";
    private final long accessExpiration = 60000; // 1 minute
    private final long refreshExpiration = 120000; // 2 minutes

    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", secret);
        ReflectionTestUtils.setField(jwtTokenProvider, "accessTokenExpiration", accessExpiration);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshTokenExpiration", refreshExpiration);

        userDetails = new User("testuser", "password", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    @Test
    void shouldGenerateAccessTokenAndExtractClaims() {
        // Act
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // Assert
        assertNotNull(token);
        assertEquals("testuser", jwtTokenProvider.extractUsername(token));
        assertTrue(jwtTokenProvider.isAccessToken(token));
        assertFalse(jwtTokenProvider.isRefreshToken(token));
        
        List<String> roles = jwtTokenProvider.extractRoles(token);
        assertNotNull(roles);
        assertEquals(1, roles.size());
        assertEquals("ROLE_ADMIN", roles.get(0));

        assertTrue(jwtTokenProvider.isTokenValid(token, userDetails));
        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void shouldGenerateRefreshToken() {
        // Act
        String token = jwtTokenProvider.generateRefreshToken(userDetails);

        // Assert
        assertNotNull(token);
        assertEquals("testuser", jwtTokenProvider.extractUsername(token));
        assertFalse(jwtTokenProvider.isAccessToken(token));
        assertTrue(jwtTokenProvider.isRefreshToken(token));
        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void shouldReturnFalse_WhenTokenUsernameDoesNotMatchUserDetails() {
        // Arrange
        String token = jwtTokenProvider.generateAccessToken(userDetails);
        UserDetails otherUser = new User("otheruser", "password", List.of());

        // Act & Assert
        assertFalse(jwtTokenProvider.isTokenValid(token, otherUser));
    }

    @Test
    void shouldReturnFalse_WhenTokenExpired() {
        // Arrange: Generate an expired token
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        String expiredToken = Jwts.builder()
                .subject("testuser")
                .expiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(key)
                .compact();

        // Act & Assert
        assertThrows(io.jsonwebtoken.ExpiredJwtException.class, () -> jwtTokenProvider.isTokenExpired(expiredToken));
        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }

    @Test
    void shouldReturnFalse_WhenTokenSignatureInvalid() {
        // Arrange: Build token with another secret
        SecretKey wrongKey = Keys.hmacShaKeyFor("wrongSecretKeyWithAtLeast256BitsLongForTestingOnly".getBytes(StandardCharsets.UTF_8));
        String invalidToken = Jwts.builder()
                .subject("testuser")
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(wrongKey)
                .compact();

        // Act & Assert
        assertFalse(jwtTokenProvider.validateToken(invalidToken));
    }

    @Test
    void shouldReturnFalse_WhenTokenMalformed() {
        // Arrange
        String malformedToken = "not.a.valid.jwt";

        // Act & Assert
        assertFalse(jwtTokenProvider.validateToken(malformedToken));
    }

    @Test
    void shouldReturnFalse_WhenTokenIsEmptyOrNull() {
        // Act & Assert
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken(null));
    }
}
