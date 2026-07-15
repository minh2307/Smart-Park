package com.smartpark.domain.settings.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.audit.entity.AuditLog;
import com.smartpark.domain.audit.service.AuditLogService;
import com.smartpark.domain.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SettingsAuditSupport {
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest request;

    public Long currentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow().getId();
    }

    public void record(String action, String table, Long recordId, Object oldValue, Object newValue, Long userId) {
        auditLogService.create(AuditLog.builder().userId(userId).action(action).targetTable(table)
                .recordId(recordId).oldValues(json(oldValue)).newValues(json(newValue))
                .ipAddress(clientIp()).build());
    }

    private String json(Object value) {
        if (value == null) return null;
        try { return objectMapper.writeValueAsString(value); }
        catch (JsonProcessingException ex) { throw new IllegalStateException("Cannot serialize audit data", ex); }
    }

    private String clientIp() {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }
}
