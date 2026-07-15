package com.smartpark.domain.backup.service;

import com.smartpark.domain.backup.entity.BackupJob;
import com.smartpark.domain.backup.entity.BackupJob.BackupTarget;
import com.smartpark.domain.backup.entity.BackupJob.BackupType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Base64;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Component
@RequiredArgsConstructor
public class BackupArtifactGenerator {
    private static final Set<String> CONFIG_TABLES = Set.of("feature_flag_settings", "security_policies", "permissions", "role_permissions", "roles");
    private static final Set<String> AUDIT_TABLES = Set.of("audit_logs", "security_audit_logs");
    private final DataSource dataSource;

    public Path generate(BackupJob job, LocalDateTime since) throws IOException, SQLException {
        Path artifact = Files.createTempFile("smartpark-" + job.getJobId() + "-", ".zip");
        try (Connection connection = dataSource.getConnection();
             OutputStream file = Files.newOutputStream(artifact);
             ZipOutputStream zip = new ZipOutputStream(new BufferedOutputStream(file), StandardCharsets.UTF_8)) {
            connection.setReadOnly(true);
            connection.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);
            connection.setAutoCommit(false);
            writeManifest(zip, job, since);
            for (String table : selectedTables(connection, job.getTarget())) exportTable(connection, zip, table, job.getBackupType(), since);
            connection.rollback();
        } catch (Exception ex) {
            Files.deleteIfExists(artifact);
            throw ex;
        }
        return artifact;
    }

    private SortedSet<String> selectedTables(Connection c, BackupTarget target) throws SQLException {
        SortedSet<String> all = new TreeSet<>();
        try (ResultSet rs = c.getMetaData().getTables(c.getCatalog(), null, "%", new String[]{"TABLE"})) {
            while (rs.next()) {
                String table = rs.getString("TABLE_NAME");
                if (safeIdentifier(table) && !"flyway_schema_history".equalsIgnoreCase(table)) all.add(table);
            }
        }
        if (target == BackupTarget.CONFIGURATION) all.retainAll(CONFIG_TABLES);
        else if (target == BackupTarget.AUDIT) all.retainAll(AUDIT_TABLES);
        return all;
    }

    private void exportTable(Connection c, ZipOutputStream zip, String table, BackupType type, LocalDateTime since)
            throws SQLException, IOException {
        List<String> columns = new ArrayList<>();
        try (ResultSet rs = c.getMetaData().getColumns(c.getCatalog(), null, table, "%")) {
            while (rs.next()) columns.add(rs.getString("COLUMN_NAME"));
        }
        if (columns.isEmpty() || columns.stream().anyMatch(col -> !safeIdentifier(col))) return;
        String temporalColumn = columns.stream().filter("updated_at"::equalsIgnoreCase).findFirst()
                .orElseGet(() -> columns.stream().filter("created_at"::equalsIgnoreCase).findFirst().orElse(null));
        if (type == BackupType.INCREMENTAL && since != null && temporalColumn == null) return;
        String sql = "SELECT * FROM `" + table + "`";
        if (type == BackupType.INCREMENTAL && since != null) sql += " WHERE `" + temporalColumn + "` >= ?";
        zip.putNextEntry(new ZipEntry("data/" + table + ".csv"));
        try (Writer writer = new OutputStreamWriter(new NonClosingOutputStream(zip), StandardCharsets.UTF_8);
             PreparedStatement statement = c.prepareStatement(sql, ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)) {
            if (type == BackupType.INCREMENTAL && since != null) statement.setTimestamp(1, Timestamp.valueOf(since));
            statement.setFetchSize(500);
            writeCsvRow(writer, columns);
            try (ResultSet rs = statement.executeQuery()) {
                while (rs.next()) {
                    List<String> values = new ArrayList<>(columns.size());
                    for (int i = 1; i <= columns.size(); i++) values.add(stringValue(rs.getObject(i)));
                    writeCsvRow(writer, values);
                }
            }
            writer.flush();
        }
        zip.closeEntry();
    }

    private void writeManifest(ZipOutputStream zip, BackupJob job, LocalDateTime since) throws IOException {
        zip.putNextEntry(new ZipEntry("manifest.properties"));
        String manifest = "format=smartpark-jdbc-csv-v1\njobId=" + job.getJobId() + "\ntype=" + job.getBackupType()
                + "\ntarget=" + job.getTarget() + "\ncreatedAt=" + LocalDateTime.now()
                + "\nincrementalSince=" + (since == null ? "" : since) + "\n";
        zip.write(manifest.getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    private void writeCsvRow(Writer writer, List<String> values) throws IOException {
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) writer.write(',');
            String value = values.get(i);
            if (value != null) writer.write('"' + value.replace("\"", "\"\"") + '"');
        }
        writer.write('\n');
    }

    private String stringValue(Object value) {
        if (value == null) return null;
        if (value instanceof byte[] bytes) return Base64.getEncoder().encodeToString(bytes);
        return String.valueOf(value);
    }
    private boolean safeIdentifier(String value) { return value != null && value.matches("[A-Za-z0-9_]+"); }
    private static final class NonClosingOutputStream extends FilterOutputStream {
        private NonClosingOutputStream(OutputStream out) { super(out); }
        @Override public void close() throws IOException { flush(); }
    }
}
