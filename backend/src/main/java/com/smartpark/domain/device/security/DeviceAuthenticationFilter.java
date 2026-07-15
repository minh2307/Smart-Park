package com.smartpark.domain.device.security;

import com.smartpark.domain.device.entity.IoTDevice;
import com.smartpark.domain.device.service.DeviceCredentialService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/** Authenticates trusted devices on the two device-only API routes. */
@RequiredArgsConstructor
public class DeviceAuthenticationFilter extends OncePerRequestFilter {
    public static final String DEVICE_ID_HEADER = "X-Device-Id";
    public static final String DEVICE_KEY_HEADER = "X-Device-Key";
    private final DeviceCredentialService credentialService;

    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.equals("/api/v1/turnstiles") || path.equals("/api/v1/lpr/scan"));
    }

    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                               FilterChain chain) throws ServletException, IOException {
        String id = request.getHeader(DEVICE_ID_HEADER);
        if (!StringUtils.hasText(id)) { chain.doFilter(request, response); return; } // staff JWT path
        String key = request.getHeader(DEVICE_KEY_HEADER);
        IoTDevice device = credentialService.authenticate(id, key).orElse(null);
        if (device == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":401,\"message\":\"Device authentication failed\"}");
            return;
        }
        String authority = device.getDeviceType() == IoTDevice.DeviceType.TURNSTILE
                ? "DEVICE_TURNSTILE" : "DEVICE_LPR";
        var auth = new UsernamePasswordAuthenticationToken("device:" + device.getDeviceCode(), null,
                List.of(new SimpleGrantedAuthority(authority)));
        auth.setDetails(device.getId());
        SecurityContextHolder.getContext().setAuthentication(auth);
        try { chain.doFilter(request, response); }
        finally { SecurityContextHolder.clearContext(); }
    }
}
