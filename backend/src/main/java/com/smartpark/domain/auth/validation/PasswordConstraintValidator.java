package com.smartpark.domain.auth.validation;

import com.smartpark.domain.settings.dto.SecurityPolicyDto;
import com.smartpark.domain.settings.service.SecurityPolicyService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;

public class PasswordConstraintValidator implements ConstraintValidator<ValidPassword, String> {
    private SecurityPolicyService policyService;

    @Autowired(required = false)
    public void setPolicyService(SecurityPolicyService policyService) {
        this.policyService = policyService;
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) return false;
        SecurityPolicyDto.Response p = policyService == null ? defaultPolicy() : policyService.get();
        boolean valid = password.length() >= p.getPasswordMinLength()
                && (!p.isPasswordRequireUppercase() || password.chars().anyMatch(Character::isUpperCase))
                && (!p.isPasswordRequireLowercase() || password.chars().anyMatch(Character::isLowerCase))
                && (!p.isPasswordRequireNumber() || password.chars().anyMatch(Character::isDigit))
                && (!p.isPasswordRequireSpecialCharacter()
                    || password.chars().anyMatch(ch -> !Character.isLetterOrDigit(ch)));
        if (!valid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password does not satisfy the active security policy")
                    .addConstraintViolation();
        }
        return valid;
    }

    private SecurityPolicyDto.Response defaultPolicy() {
        return SecurityPolicyDto.Response.builder().passwordMinLength(8).passwordRequireUppercase(true)
                .passwordRequireLowercase(true).passwordRequireNumber(true)
                .passwordRequireSpecialCharacter(false).build();
    }
}
