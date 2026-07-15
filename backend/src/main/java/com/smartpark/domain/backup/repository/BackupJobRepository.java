package com.smartpark.domain.backup.repository;

import com.smartpark.domain.backup.entity.BackupJob;
import com.smartpark.domain.backup.entity.BackupJob.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;

public interface BackupJobRepository extends JpaRepository<BackupJob, Long> {
    boolean existsByBackupTypeAndStatusIn(BackupType type, Collection<BackupStatus> statuses);
    Optional<BackupJob> findTopByTargetAndStatusOrderByCompletedAtDesc(BackupTarget target, BackupStatus status);
}
