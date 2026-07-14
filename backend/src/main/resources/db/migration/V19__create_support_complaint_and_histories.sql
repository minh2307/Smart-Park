-- 1. Create support_tickets table
CREATE TABLE support_tickets (
    id BIGINT NOT NULL AUTO_INCREMENT,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    assigned_employee_id BIGINT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    resolution TEXT NULL,
    closed_date DATETIME(6) NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_support_tickets_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_support_tickets_employee FOREIGN KEY (assigned_employee_id) REFERENCES employees(id)
) ENGINE=InnoDB;

-- 2. Create support_comments table
CREATE TABLE support_comments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_support_comments_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_support_comments_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 3. Create complaints table
CREATE TABLE complaints (
    id BIGINT NOT NULL AUTO_INCREMENT,
    complaint_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    complaint_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evidence VARCHAR(255) NULL,
    assigned_staff_id BIGINT NULL,
    resolution TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_complaints_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_complaints_staff FOREIGN KEY (assigned_staff_id) REFERENCES employees(id)
) ENGINE=InnoDB;

-- 4. Create complaint_history table
CREATE TABLE complaint_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    complaint_id BIGINT NOT NULL,
    status_from VARCHAR(50) NULL,
    status_to VARCHAR(50) NOT NULL,
    action_details TEXT NULL,
    performed_by BIGINT NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_complaint_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_history_user FOREIGN KEY (performed_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- 5. Create incident_history table
CREATE TABLE incident_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    incident_id BIGINT NOT NULL,
    status_from VARCHAR(50) NULL,
    status_to VARCHAR(50) NOT NULL,
    action_details TEXT NULL,
    performed_by BIGINT NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_incident_history_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Add incident_number to incidents table
ALTER TABLE incidents ADD COLUMN incident_number VARCHAR(50) NULL UNIQUE;

