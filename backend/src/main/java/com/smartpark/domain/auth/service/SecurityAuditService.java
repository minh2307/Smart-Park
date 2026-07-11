package com.smartpark.domain.auth.service;

import com.smartpark.domain.auth.entity.SecurityAuditLog;
import com.smartpark.domain.auth.repository.SecurityAuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityAuditService {

    private final SecurityAuditLogRepository auditLogRepository;
    private final HttpServletRequest request;

    public void logAudit(Long userId, String action) {
        String ipAddress = getClientIP(request);
        
        SecurityAuditLog logEntry = SecurityAuditLog.builder()
                .userId(userId)
                .action(action)
                .ipAddress(ipAddress)
                .build();
                
        auditLogRepository.save(logEntry);
        log.debug("Security audit logged: userId={}, action={}, ip={}", userId, action, ipAddress);
    }
    
    private String getClientIP(HttpServletRequest request) {
        if (request == null) return null;
        
        String[] headers = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_CLIENT_IP",
            "HTTP_X_FORWARDED_FOR"
        };
        
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
                // If multiple IPs are present, return the first one
                return ip.split(",")[0].trim();
            }
        }
        
        return request.getRemoteAddr();
    }
}
