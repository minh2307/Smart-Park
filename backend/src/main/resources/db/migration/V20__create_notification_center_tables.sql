-- 1. Create notification_templates table
CREATE TABLE notification_templates (
    id BIGINT NOT NULL AUTO_INCREMENT,
    template_code VARCHAR(100) NOT NULL UNIQUE,
    template_name VARCHAR(150) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- EMAIL, SMS, PUSH, IN_APP
    subject VARCHAR(255) NULL,
    body TEXT NOT NULL,
    variables VARCHAR(255) NULL, -- comma separated variables like: name, otp
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    PRIMARY KEY (id),
    INDEX idx_templates_code (template_code)
) ENGINE=InnoDB;

-- 2. Drop original notifications table to apply new columns
DROP TABLE IF EXISTS notifications;

-- 3. Re-create notifications table
CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- EMAIL, SMS, PUSH, IN_APP
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    expiration_time DATETIME(6) NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    INDEX idx_notifications_type_status (type, status)
) ENGINE=InnoDB;

-- 4. Create notification_recipients table for targeting User, Customer or Employee
CREATE TABLE notification_recipients (
    id BIGINT NOT NULL AUTO_INCREMENT,
    notification_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    customer_id BIGINT NULL,
    employee_id BIGINT NULL,
    read_status VARCHAR(50) NOT NULL DEFAULT 'UNREAD', -- UNREAD, READ
    read_at DATETIME(6) NULL,
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    delivered_at DATETIME(6) NULL,
    error_message TEXT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_recipient_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipient_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipient_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_recipients_user (user_id),
    INDEX idx_recipients_customer (customer_id),
    INDEX idx_recipients_employee (employee_id)
) ENGINE=InnoDB;

-- 5. Create email_history table
CREATE TABLE email_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    attachment_path VARCHAR(255) NULL,
    send_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    sent_at DATETIME(6) NULL,
    error_message TEXT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_email_recipient (recipient),
    INDEX idx_email_status (send_status)
) ENGINE=InnoDB;

-- 6. Create sms_history table
CREATE TABLE sms_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sent_at DATETIME(6) NULL,
    error_message TEXT NULL,
    PRIMARY KEY (id),
    INDEX idx_sms_phone (phone_number),
    INDEX idx_sms_status (delivery_status)
) ENGINE=InnoDB;

-- 7. Create push_history table
CREATE TABLE push_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    device_token VARCHAR(255) NOT NULL,
    topic VARCHAR(100) NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    send_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sent_at DATETIME(6) NULL,
    error_message TEXT NULL,
    PRIMARY KEY (id),
    INDEX idx_push_token (device_token),
    INDEX idx_push_status (send_status)
) ENGINE=InnoDB;
