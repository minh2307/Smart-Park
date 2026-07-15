ALTER TABLE audit_logs ADD COLUMN resource VARCHAR(100) NULL;
ALTER TABLE audit_logs ADD COLUMN result VARCHAR(20) NULL;
ALTER TABLE audit_logs ADD COLUMN correlation_id VARCHAR(64) NULL;

CREATE INDEX idx_audit_logs_resource_created_at
    ON audit_logs (resource, created_at);

CREATE INDEX idx_audit_logs_correlation_id
    ON audit_logs (correlation_id);
