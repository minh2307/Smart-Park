CREATE TABLE feature_flag_settings (
    id TINYINT NOT NULL,
    dynamic_pricing_enabled BIT NOT NULL DEFAULT 1,
    ai_forecast_enabled BIT NOT NULL DEFAULT 1,
    online_booking_enabled BIT NOT NULL DEFAULT 1,
    pos_enabled BIT NOT NULL DEFAULT 1,
    membership_enabled BIT NOT NULL DEFAULT 1,
    weather_integration_enabled BIT NOT NULL DEFAULT 1,
    lpr_enabled BIT NOT NULL DEFAULT 1,
    turnstile_enabled BIT NOT NULL DEFAULT 1,
    maintenance_prediction_enabled BIT NOT NULL DEFAULT 0,
    notification_enabled BIT NOT NULL DEFAULT 1,
    version BIGINT NOT NULL DEFAULT 0,
    updated_at DATETIME(6) NOT NULL,
    updated_by BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT chk_feature_flag_singleton CHECK (id = 1),
    CONSTRAINT fk_feature_flags_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB;

INSERT INTO feature_flag_settings (id, updated_at) VALUES (1, CURRENT_TIMESTAMP(6));

CREATE TABLE security_policies (
    id TINYINT NOT NULL,
    password_min_length INT NOT NULL DEFAULT 8,
    password_require_uppercase BIT NOT NULL DEFAULT 1,
    password_require_lowercase BIT NOT NULL DEFAULT 1,
    password_require_number BIT NOT NULL DEFAULT 1,
    password_require_special_character BIT NOT NULL DEFAULT 1,
    bcrypt_strength INT NOT NULL DEFAULT 12,
    access_token_minutes INT NOT NULL DEFAULT 30,
    refresh_token_days INT NOT NULL DEFAULT 7,
    max_login_attempts INT NOT NULL DEFAULT 5,
    login_attempt_window_minutes INT NOT NULL DEFAULT 10,
    account_lock_minutes INT NOT NULL DEFAULT 30,
    mfa_required_for_admin BIT NOT NULL DEFAULT 0,
    session_idle_timeout_minutes INT NOT NULL DEFAULT 30,
    version BIGINT NOT NULL DEFAULT 0,
    updated_at DATETIME(6) NOT NULL,
    updated_by BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT chk_security_policy_singleton CHECK (id = 1),
    CONSTRAINT chk_security_bcrypt_strength CHECK (bcrypt_strength BETWEEN 10 AND 15),
    CONSTRAINT chk_security_password_length CHECK (password_min_length BETWEEN 8 AND 128),
    CONSTRAINT fk_security_policy_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB;

INSERT INTO security_policies (id, updated_at) VALUES (1, CURRENT_TIMESTAMP(6));

CREATE TABLE backup_jobs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    job_id VARCHAR(32) NOT NULL,
    backup_type VARCHAR(20) NOT NULL,
    target VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    reason VARCHAR(500),
    requested_by BIGINT NOT NULL,
    requested_at DATETIME(6) NOT NULL,
    started_at DATETIME(6),
    completed_at DATETIME(6),
    storage_location_reference VARCHAR(500),
    checksum VARCHAR(128),
    failure_reason VARCHAR(1000),
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_backup_jobs_job_id UNIQUE (job_id),
    CONSTRAINT fk_backup_jobs_requested_by FOREIGN KEY (requested_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_backup_jobs_status_requested ON backup_jobs(status, requested_at);
CREATE INDEX idx_backup_jobs_type_status ON backup_jobs(backup_type, status);
CREATE INDEX idx_backup_jobs_requester_time ON backup_jobs(requested_by, requested_at);

CREATE TABLE backup_execution_locks (
    id TINYINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_backup_lock_singleton CHECK (id = 1)
) ENGINE=InnoDB;

INSERT INTO backup_execution_locks (id) VALUES (1);

INSERT INTO permissions (name, code, description, created_at)
SELECT 'View system settings', 'SETTINGS_VIEW', 'View feature flags and security policy', CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'SETTINGS_VIEW');

INSERT INTO permissions (name, code, description, created_at)
SELECT 'Update system settings', 'SETTINGS_UPDATE', 'Update settings and trigger backups', CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'SETTINGS_UPDATE');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('SETTINGS_VIEW', 'SETTINGS_UPDATE')
WHERE r.code = 'SYSTEM_ADMIN'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);
