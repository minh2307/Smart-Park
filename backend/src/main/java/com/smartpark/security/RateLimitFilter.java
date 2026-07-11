package com.smartpark.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.github.bucket4j.distributed.proxy.ProxyManager;
import java.io.IOException;
import java.time.Duration;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;

/**
 * Rate Limiting Filter using Bucket4j (In-Memory per IP).
 * Applied to /api/v1/auth/login to prevent brute-force attacks.
 */
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final ProxyManager<byte[]> proxyManager;



    private Bucket resolveBucket(String ip, String endpoint) {
        String key = "RL:" + endpoint + ":" + ip;
        Supplier<io.github.bucket4j.BucketConfiguration> configSupplier = () -> io.github.bucket4j.BucketConfiguration.builder()
                .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
                .build();
        return proxyManager.builder().build(key.getBytes(), configSupplier);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        if (uri.startsWith("/api/v1/auth/login") || uri.startsWith("/api/v1/auth/register") || uri.startsWith("/api/v1/auth/refresh")) {
            String ip = getClientIP(request);
            String endpoint = uri.replace("/api/v1/auth/", "");
            Bucket bucket = resolveBucket(ip, endpoint);
            if (!bucket.tryConsume(1)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"status\": 429, \"message\": \"Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
