package com.smartpark.domain.settings.mapper;

import com.smartpark.domain.settings.dto.SecurityPolicyDto;
import com.smartpark.domain.settings.entity.SecurityPolicy;
import org.springframework.stereotype.Component;

@Component
public class SecurityPolicyMapper {
    public SecurityPolicyDto.Response toResponse(SecurityPolicy e) {
        return SecurityPolicyDto.Response.builder()
                .passwordMinLength(e.getPasswordMinLength()).passwordRequireUppercase(e.isPasswordRequireUppercase())
                .passwordRequireLowercase(e.isPasswordRequireLowercase()).passwordRequireNumber(e.isPasswordRequireNumber())
                .passwordRequireSpecialCharacter(e.isPasswordRequireSpecialCharacter()).bcryptStrength(e.getBcryptStrength())
                .accessTokenMinutes(e.getAccessTokenMinutes()).refreshTokenDays(e.getRefreshTokenDays())
                .maxLoginAttempts(e.getMaxLoginAttempts()).loginAttemptWindowMinutes(e.getLoginAttemptWindowMinutes())
                .accountLockMinutes(e.getAccountLockMinutes()).mfaRequiredForAdmin(e.isMfaRequiredForAdmin())
                .sessionIdleTimeoutMinutes(e.getSessionIdleTimeoutMinutes()).updatedAt(e.getUpdatedAt())
                .updatedBy(e.getUpdatedBy()).build();
    }

    public void update(SecurityPolicyDto.UpdateRequest r, SecurityPolicy e) {
        e.setPasswordMinLength(r.getPasswordMinLength());
        e.setPasswordRequireUppercase(r.getPasswordRequireUppercase());
        e.setPasswordRequireLowercase(r.getPasswordRequireLowercase());
        e.setPasswordRequireNumber(r.getPasswordRequireNumber());
        e.setPasswordRequireSpecialCharacter(r.getPasswordRequireSpecialCharacter());
        e.setBcryptStrength(r.getBcryptStrength());
        e.setAccessTokenMinutes(r.getAccessTokenMinutes());
        e.setRefreshTokenDays(r.getRefreshTokenDays());
        e.setMaxLoginAttempts(r.getMaxLoginAttempts());
        e.setLoginAttemptWindowMinutes(r.getLoginAttemptWindowMinutes());
        e.setAccountLockMinutes(r.getAccountLockMinutes());
        e.setMfaRequiredForAdmin(r.getMfaRequiredForAdmin());
        e.setSessionIdleTimeoutMinutes(r.getSessionIdleTimeoutMinutes());
    }
}
