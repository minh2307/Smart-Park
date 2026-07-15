package com.smartpark.domain.backup.service.impl;

import com.smartpark.common.exception.ConflictException;
import com.smartpark.domain.backup.dto.BackupDto;
import com.smartpark.domain.backup.entity.BackupJob;
import com.smartpark.domain.backup.entity.BackupJob.*;
import com.smartpark.domain.backup.mapper.BackupMapper;
import com.smartpark.domain.backup.repository.BackupExecutionLockRepository;
import com.smartpark.domain.backup.repository.BackupJobRepository;
import com.smartpark.domain.backup.service.BackupJobWorker;
import com.smartpark.domain.backup.service.BackupService;
import com.smartpark.domain.settings.service.SettingsAuditSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BackupServiceImpl implements BackupService {
    private final BackupJobRepository repository;
    private final BackupExecutionLockRepository lockRepository;
    private final BackupJobWorker worker;
    private final BackupMapper mapper;
    private final SettingsAuditSupport audit;

    @Override
    @Transactional
    public BackupDto.Response trigger(BackupDto.Request request) {
        lockRepository.acquire();
        if (request.getBackupType() == BackupType.FULL && repository.existsByBackupTypeAndStatusIn(
                BackupType.FULL, List.of(BackupStatus.QUEUED, BackupStatus.RUNNING))) {
            throw new ConflictException("A full backup is already queued or running");
        }
        Long userId = audit.currentUserId();
        BackupJob job = BackupJob.builder().jobId(newJobId()).backupType(request.getBackupType())
                .target(request.getTarget()).status(BackupStatus.QUEUED).reason(trimToNull(request.getReason()))
                .requestedBy(userId).requestedAt(LocalDateTime.now()).build();
        repository.saveAndFlush(job);
        audit.record("CREATE", "backup_jobs", job.getId(), null, mapper.toResponse(job), userId);
        Long id = job.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() { worker.process(id); }
        });
        return mapper.toResponse(job);
    }

    private String newJobId() {
        return "BKP-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    private String trimToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
