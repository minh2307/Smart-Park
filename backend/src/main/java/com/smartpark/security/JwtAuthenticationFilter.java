package com.smartpark.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter — giải mã JWT từ Authorization header tại mỗi request.
 * MODULE 2: Authorization - kiểm tra vai trò từ JWT trước khi định tuyến request.
 * NFR-SEC-02: RBAC + Spring Security + JWT filter chain.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        
        // Check if token is blacklisted (Logged out)
        if (Boolean.TRUE.equals(redisTemplate.hasKey("BL:" + jwt))) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"status\": 401, \"message\": \"Token has been revoked or logged out.\"}");
            return;
        }

        String username = null;

        try {
            username = jwtService.extractUsername(jwt);
        } catch (Exception ex) {
            log.debug("Could not extract username from JWT: {}", ex.getMessage());
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Read authorities directly from token to save DB trips
            java.util.List<String> authorityStrings = jwtService.extractClaim(jwt, claims -> {
                Object authoritiesObj = claims.get("authorities");
                if (authoritiesObj instanceof java.util.List) {
                    return (java.util.List<String>) authoritiesObj;
                }
                return java.util.Collections.emptyList();
            });
            
            java.util.Collection<org.springframework.security.core.GrantedAuthority> authorities = authorityStrings.stream()
                    .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                    .collect(java.util.stream.Collectors.toList());

            UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername(username)
                    .password("") // Empty password since it's just for context
                    .authorities(authorities)
                    .build();

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
