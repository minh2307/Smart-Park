package com.smartpark.domain.settings.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.settings.config.SettingsProperties;
import com.smartpark.domain.settings.dto.SecurityPolicyDto;
import com.smartpark.domain.settings.mapper.SecurityPolicyMapper;
import com.smartpark.domain.settings.repository.SecurityPolicyRepository;
import com.smartpark.domain.settings.service.impl.SecurityPolicyServiceImpl;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class SecurityPolicyServiceImplTest {
    @Test
    void rejectsAccessTokenAboveEnterpriseMaximum() {
        SettingsProperties properties = new SettingsProperties();
        properties.setEnterpriseMaxAccessTokenMinutes(60);
        SecurityPolicyServiceImpl service = new SecurityPolicyServiceImpl(mock(SecurityPolicyRepository.class),
                new SecurityPolicyMapper(), mock(SettingsAuditSupport.class), properties);
        SecurityPolicyDto.UpdateRequest request = SecurityPolicyDto.UpdateRequest.builder()
                .accessTokenMinutes(61).refreshTokenDays(7).build();
        assertThrows(BusinessException.class, () -> service.update(request));
    }
}
