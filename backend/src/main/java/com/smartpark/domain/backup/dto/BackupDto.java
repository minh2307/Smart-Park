package com.smartpark.domain.backup.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.smartpark.domain.backup.entity.BackupJob.BackupTarget;
import com.smartpark.domain.backup.entity.BackupJob.BackupType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

public final class BackupDto {
    private BackupDto() {}

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = false)
    public static class Request {
        @NotNull private BackupType backupType;
        @NotNull private BackupTarget target;
        @Size(max = 500) private String reason;

        @JsonAnySetter
        public void rejectUnknown(String name, Object value) {
            throw new IllegalArgumentException("Unsupported backup field: " + name);
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private String jobId;
        private String status;
        private BackupType backupType;
        private BackupTarget target;
        private Long requestedBy;
        private LocalDateTime requestedAt;
    }
}
