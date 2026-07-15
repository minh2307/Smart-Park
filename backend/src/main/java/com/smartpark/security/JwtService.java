package com.smartpark.security;

import com.smartpark.domain.settings.service.SecurityPolicyService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
@RequiredArgsConstructor
public class JwtService {
    private final SecurityPolicyService securityPolicyService;

    @Value("${app.jwt.secret}")
    private String jwtSecret;
    @Value("${app.jwt.access-token-expiration:900000}")
    private long accessTokenExpirationMs;
    @Value("${app.jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", userDetails.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority).toList());
        return generateToken(claims, userDetails, currentAccessTokenExpirationMs());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        claims.put("authorities", userDetails.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority).toList());
        return generateToken(claims, userDetails, currentRefreshTokenExpirationMs());
    }

    private String generateToken(Map<String, Object> claims, UserDetails userDetails, long expirationMs) {
        return Jwts.builder().claims(claims).subject(userDetails.getUsername()).issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs)).signWith(getSigningKey()).compact();
    }

    public long currentRefreshTokenDays() {
        try { return securityPolicyService.get().getRefreshTokenDays(); }
        catch (RuntimeException ex) {
            log.warn("Security policy unavailable; using configured refresh token lifetime: {}", ex.getMessage());
            return Math.max(1, refreshTokenExpirationMs / 86_400_000L);
        }
    }

    private long currentAccessTokenExpirationMs() {
        try { return securityPolicyService.get().getAccessTokenMinutes() * 60_000L; }
        catch (RuntimeException ex) {
            log.warn("Security policy unavailable; using configured access token lifetime: {}", ex.getMessage());
            return accessTokenExpirationMs;
        }
    }

    private long currentRefreshTokenExpirationMs() { return currentRefreshTokenDays() * 86_400_000L; }
    public String extractUsername(String token) { return extractClaim(token, Claims::getSubject); }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            return extractUsername(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) { return extractExpiration(token).before(new Date()); }
    private Date extractExpiration(String token) { return extractClaim(token, Claims::getExpiration); }

    public long getRemainingTimeInSeconds(String token) {
        long diff = extractExpiration(token).getTime() - System.currentTimeMillis();
        return diff > 0 ? diff / 1000 : 0;
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }
}
