package com.smartpark.domain.backup.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "backup_execution_locks")
@Getter @Setter
public class BackupExecutionLock {
    @Id private Byte id;
}
