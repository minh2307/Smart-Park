package com.smartpark.domain.settings.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.settings.config.SettingsProperties;
import com.smartpark.domain.settings.dto.SecurityPolicyDto;
import com.smartpark.domain.settings.entity.SecurityPolicy;
import com.smartpark.domain.settings.mapper.SecurityPolicyMapper;
import com.smartpark.domain.settings.repository.SecurityPolicyRepository;
import com.smartpark.domain.settings.service.SecurityPolicyService;
import com.smartpark.domain.settings.service.SettingsAuditSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SecurityPolicyServiceImpl implements SecurityPolicyService {
    private final SecurityPolicyRepository repository;
    private final SecurityPolicyMapper mapper;
    private final SettingsAuditSupport audit;
    private final SettingsProperties properties;

    @Override
    @Transactional(readOnly = true)
    public SecurityPolicyDto.Response get() {
        return mapper.toResponse(repository.findById((byte) 1)
                .orElseThrow(() -> new ResourceNotFoundException("Security policy", 1L)));
    }

    @Override
    @Transactional
    public SecurityPolicyDto.Response update(SecurityPolicyDto.UpdateRequest request) {
        if (request.getAccessTokenMinutes() > properties.getEnterpriseMaxAccessTokenMinutes()) {
            throw new BusinessException("ERR-SECURITY-POLICY-RANGE",
                    "Access token lifetime exceeds enterprise maximum of "
                            + properties.getEnterpriseMaxAccessTokenMinutes() + " minutes");
        }
        SecurityPolicy entity = repository.findForUpdate()
                .orElseThrow(() -> new ResourceNotFoundException("Security policy", 1L));
        SecurityPolicyDto.Response before = mapper.toResponse(entity);
        mapper.update(request, entity);
        Long userId = audit.currentUserId();
        entity.setUpdatedBy(userId);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.saveAndFlush(entity);
        SecurityPolicyDto.Response after = mapper.toResponse(entity);
        audit.record("UPDATE", "security_policies", 1L, before, after, userId);
        return after;
    }
}
