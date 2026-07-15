package com.smartpark.domain.backup.service;

import com.smartpark.domain.backup.entity.BackupJob;
import com.smartpark.domain.backup.entity.BackupJob.BackupStatus;
import com.smartpark.domain.backup.repository.BackupJobRepository;
import com.smartpark.domain.backup.storage.BackupStorage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupJobWorker {
    private final BackupJobRepository repository;
    private final BackupArtifactGenerator generator;
    private final BackupStorage storage;

    @Async("backupTaskExecutor")
    @Transactional
    public void process(Long id) {
        BackupJob job = repository.findById(id).orElse(null);
        if (job == null || job.getStatus() != BackupStatus.QUEUED) return;
        Path artifact = null;
        try {
            job.setStatus(BackupStatus.RUNNING);
            job.setStartedAt(LocalDateTime.now());
            repository.saveAndFlush(job);
            LocalDateTime since = job.getBackupType() == BackupJob.BackupType.INCREMENTAL
                    ? repository.findTopByTargetAndStatusOrderByCompletedAtDesc(job.getTarget(), BackupStatus.COMPLETED)
                    .map(BackupJob::getCompletedAt).orElse(null) : null;
            artifact = generator.generate(job, since);
            String checksum = sha256(artifact);
            String reference = storage.store(artifact, job.getJobId() + ".zip");
            artifact = null;
            job.setChecksum(checksum);
            job.setStorageLocationReference(reference);
            job.setStatus(BackupStatus.COMPLETED);
            job.setCompletedAt(LocalDateTime.now());
            repository.save(job);
            log.info("Backup completed: jobId={}, type={}, target={}", job.getJobId(), job.getBackupType(), job.getTarget());
        } catch (Exception ex) {
            job.setStatus(BackupStatus.FAILED);
            job.setCompletedAt(LocalDateTime.now());
            job.setFailureReason(safeFailure(ex));
            repository.save(job);
            log.error("Backup failed: jobId={}", job.getJobId(), ex);
        } finally {
            if (artifact != null) try { Files.deleteIfExists(artifact); } catch (Exception ignored) { }
        }
    }

    private String sha256(Path path) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream input = Files.newInputStream(path)) {
            byte[] buffer = new byte[8192];
            for (int read; (read = input.read(buffer)) != -1;) digest.update(buffer, 0, read);
        }
        return HexFormat.of().formatHex(digest.digest());
    }

    private String safeFailure(Exception ex) {
        String value = ex.getClass().getSimpleName() + ": " + (ex.getMessage() == null ? "backup failed" : ex.getMessage());
        value = value.replaceAll("(?i)(password|secret|token|key)=[^\\s,;]+", "$1=[redacted]");
        return value.substring(0, Math.min(1000, value.length()));
    }
}
