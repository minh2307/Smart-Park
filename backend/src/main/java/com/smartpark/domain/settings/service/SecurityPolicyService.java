package com.smartpark.domain.settings.service;

import com.smartpark.domain.settings.dto.SecurityPolicyDto;

public interface SecurityPolicyService {
    SecurityPolicyDto.Response get();
    SecurityPolicyDto.Response update(SecurityPolicyDto.UpdateRequest request);
}
