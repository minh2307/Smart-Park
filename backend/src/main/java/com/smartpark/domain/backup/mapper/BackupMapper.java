package com.smartpark.domain.backup.mapper;

import com.smartpark.domain.backup.dto.BackupDto;
import com.smartpark.domain.backup.entity.BackupJob;
import org.springframework.stereotype.Component;

@Component
public class BackupMapper {
    public BackupDto.Response toResponse(BackupJob job) {
        return BackupDto.Response.builder().jobId(job.getJobId()).status(job.getStatus().name())
                .backupType(job.getBackupType()).target(job.getTarget()).requestedBy(job.getRequestedBy())
                .requestedAt(job.getRequestedAt()).build();
    }
}
