CREATE TABLE report_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    export_format VARCHAR(10) NOT NULL,
    email_recipients TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    filters TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE TABLE report_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    filters_used TEXT,
    file_path VARCHAR(255),
    file_size BIGINT,
    download_url VARCHAR(255),
    expires_at TIMESTAMP NULL,
    error_message TEXT
);

CREATE TABLE export_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_history_id BIGINT,
    export_format VARCHAR(10) NOT NULL,
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exported_by VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    download_url VARCHAR(255),
    expires_at TIMESTAMP NULL,
    CONSTRAINT fk_export_report_history FOREIGN KEY (report_history_id) REFERENCES report_history(id) ON DELETE SET NULL
);
