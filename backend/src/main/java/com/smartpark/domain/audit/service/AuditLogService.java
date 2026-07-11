package com.smartpark.domain.audit.service;

import com.smartpark.domain.audit.entity.AuditLog;
import com.smartpark.domain.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public Page<AuditLog> findAll(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    @Transactional
    public AuditLog create(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }
}
