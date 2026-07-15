package com.smartpark.domain.settings.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public final class SecurityPolicyDto {
    private SecurityPolicyDto() {}

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = false)
    public static class UpdateRequest {
        @NotNull @Min(8) @Max(128) private Integer passwordMinLength;
        @NotNull private Boolean passwordRequireUppercase;
        @NotNull private Boolean passwordRequireLowercase;
        @NotNull private Boolean passwordRequireNumber;
        @NotNull private Boolean passwordRequireSpecialCharacter;
        @NotNull @Min(10) @Max(15) private Integer bcryptStrength;
        @NotNull @Min(5) @Max(1440) private Integer accessTokenMinutes;
        @NotNull @Min(1) @Max(90) private Integer refreshTokenDays;
        @NotNull @Min(1) @Max(20) private Integer maxLoginAttempts;
        @NotNull @Min(1) @Max(1440) private Integer loginAttemptWindowMinutes;
        @NotNull @Min(1) @Max(10080) private Integer accountLockMinutes;
        @NotNull private Boolean mfaRequiredForAdmin;
        @NotNull @Min(5) @Max(1440) private Integer sessionIdleTimeoutMinutes;

        @AssertTrue(message = "Refresh token lifetime must be greater than access token lifetime")
        public boolean isRefreshLongerThanAccess() {
            return refreshTokenDays == null || accessTokenMinutes == null
                    || refreshTokenDays * 1440L > accessTokenMinutes;
        }

        @JsonAnySetter
        public void rejectUnknown(String name, Object value) {
            throw new IllegalArgumentException("Unsupported security setting: " + name);
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
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
        private LocalDateTime updatedAt;
        private Long updatedBy;
    }
}
