package com.smartpark.domain.settings.security;

import com.smartpark.domain.settings.service.SecurityPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@RequiredArgsConstructor
public class PolicyAwarePasswordEncoder implements PasswordEncoder {
    private final SecurityPolicyService policyService;

    @Override
    public String encode(CharSequence rawPassword) {
        return new BCryptPasswordEncoder(policyService.get().getBcryptStrength()).encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
    }

    @Override
    public boolean upgradeEncoding(String encodedPassword) {
        return new BCryptPasswordEncoder(policyService.get().getBcryptStrength()).upgradeEncoding(encodedPassword);
    }
}
