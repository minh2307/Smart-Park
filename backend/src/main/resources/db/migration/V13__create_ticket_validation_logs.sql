-- Create ticket validation logs table to track check-in attempts and scans
CREATE TABLE ticket_validation_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    ticket_id BIGINT NULL,
    ticket_code VARCHAR(100) NOT NULL,
    customer_name VARCHAR(150) NULL,
    attraction_id BIGINT NULL,
    attraction_name VARCHAR(150) NULL,
    check_in_time DATETIME(6) NOT NULL,
    status VARCHAR(50) NOT NULL,
    gate_id BIGINT NULL,
    gate_code VARCHAR(50) NULL,
    operator_name VARCHAR(100) NULL,
    failure_reason VARCHAR(255) NULL,
    remaining_usage INT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_val_logs_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    CONSTRAINT fk_val_logs_ride FOREIGN KEY (attraction_id) REFERENCES rides(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
