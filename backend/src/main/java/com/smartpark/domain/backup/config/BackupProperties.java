package com.smartpark.domain.backup.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.backup")
public class BackupProperties {
    private String storageType = "local";
    private String localDirectory = System.getProperty("java.io.tmpdir") + "/smartpark-backups";
    private int retentionDays = 30;
}
