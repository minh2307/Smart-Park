-- 1. Alter lockers table to add missing fields
ALTER TABLE lockers ADD COLUMN locker_number VARCHAR(50) NOT NULL UNIQUE;
ALTER TABLE lockers ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'STANDARD';
ALTER TABLE lockers ADD COLUMN rental_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE lockers ADD COLUMN location VARCHAR(255) NULL;
ALTER TABLE lockers ADD COLUMN qr_code VARCHAR(255) NULL;
ALTER TABLE lockers ADD COLUMN current_availability BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE lockers ADD COLUMN updated_at DATETIME(6) NULL;

-- Alter lockers.status enum to VARCHAR(50) for state changes compatibility
ALTER TABLE lockers MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE';

-- 2. Alter locker_transactions (mapped as rentals) to support complete rental fields
ALTER TABLE locker_transactions ADD COLUMN deposit DECIMAL(15, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE locker_transactions ADD COLUMN rental_fee DECIMAL(15, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE locker_transactions ADD COLUMN penalty_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE locker_transactions ADD COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING';

-- Alter locker_transactions.status enum to VARCHAR(50) for state changes compatibility
ALTER TABLE locker_transactions MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';

-- 3. Create locker_maintenances table
CREATE TABLE locker_maintenances (
    id BIGINT AUTO_INCREMENT NOT NULL,
    locker_id BIGINT NOT NULL,
    maintenance_date DATETIME NOT NULL,
    reason VARCHAR(255) NULL,
    technician VARCHAR(100) NULL,
    completion_date DATETIME NULL,
    maintenance_status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_locker_maintenance_locker FOREIGN KEY (locker_id) REFERENCES lockers (id)
) ENGINE=InnoDB;
