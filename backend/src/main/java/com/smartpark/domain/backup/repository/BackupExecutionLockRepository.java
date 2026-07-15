package com.smartpark.domain.backup.repository;

import com.smartpark.domain.backup.entity.BackupExecutionLock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface BackupExecutionLockRepository extends JpaRepository<BackupExecutionLock, Byte> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from BackupExecutionLock l where l.id = 1")
    BackupExecutionLock acquire();
}
