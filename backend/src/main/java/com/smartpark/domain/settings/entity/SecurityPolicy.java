package com.smartpark.domain.settings.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_policies")
@Getter @Setter
public class SecurityPolicy {
    @Id private Byte id;
    private int passwordMinLength;
    private boolean passwordRequireUppercase;
    private boolean passwordRequireLowercase;
    private boolean passwordRequireNumber;
    private boolean passwordRequireSpecialCharacter;
    private int bcryptStrength;
    private int accessTokenMinutes;
    private int refreshTokenDays;
    private int maxLoginAttempts;
    private int loginAttemptWindowMinutes;
    private int accountLockMinutes;
    private boolean mfaRequiredForAdmin;
    private int sessionIdleTimeoutMinutes;
    @Version private long version;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}
