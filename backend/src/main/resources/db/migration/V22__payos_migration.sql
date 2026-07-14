-- Add new columns for payOS integration to the payments table
ALTER TABLE payments
    ADD COLUMN provider VARCHAR(50),
    ADD COLUMN provider_payment_link_id VARCHAR(100),
    ADD COLUMN provider_transaction_id VARCHAR(100),
    ADD COLUMN order_code VARCHAR(100),
    ADD COLUMN checkout_url VARCHAR(500),
    ADD COLUMN qr_code TEXT,
    ADD COLUMN provider_status VARCHAR(50),
    ADD COLUMN paid_at TIMESTAMP,
    ADD COLUMN cancelled_at TIMESTAMP,
    ADD COLUMN expired_at TIMESTAMP,
    ADD COLUMN failure_reason VARCHAR(255);

-- Create webhook_logs table
CREATE TABLE webhook_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    event_id VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(100),
    order_code VARCHAR(100),
    signature_valid BOOLEAN,
    processing_status VARCHAR(50) NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    retry_count INT DEFAULT 0,
    CONSTRAINT uq_webhook_provider_event UNIQUE (provider, event_id)
);
