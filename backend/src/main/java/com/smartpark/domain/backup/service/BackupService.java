package com.smartpark.domain.backup.service;

import com.smartpark.domain.backup.dto.BackupDto;

public interface BackupService {
    BackupDto.Response trigger(BackupDto.Request request);
}
