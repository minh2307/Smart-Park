package com.smartpark.domain.backup.storage;

import com.smartpark.domain.backup.config.BackupProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.*;

@Component
@RequiredArgsConstructor
public class LocalBackupStorage implements BackupStorage {
    private final BackupProperties properties;

    @Override
    public String store(Path artifact, String objectName) throws IOException {
        if (!"local".equalsIgnoreCase(properties.getStorageType())) {
            throw new IllegalStateException("Unsupported backup storage type: " + properties.getStorageType());
        }
        String safeName = objectName.replaceAll("[^A-Za-z0-9._-]", "_");
        Path root = Paths.get(properties.getLocalDirectory()).toAbsolutePath().normalize();
        Files.createDirectories(root);
        Path destination = root.resolve(safeName).normalize();
        if (!destination.startsWith(root)) throw new SecurityException("Invalid backup object name");
        try {
            Files.move(artifact, destination, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException ex) {
            Files.move(artifact, destination, StandardCopyOption.REPLACE_EXISTING);
        }
        return "local:" + safeName;
    }
}
