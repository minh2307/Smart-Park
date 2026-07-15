package com.smartpark.domain.backup.storage;

import java.io.IOException;
import java.nio.file.Path;

public interface BackupStorage {
    String store(Path artifact, String objectName) throws IOException;
}
