-- Create Campaigns Table
CREATE TABLE campaigns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(15,2),
    target_customers VARCHAR(100),
    status VARCHAR(30) NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
) ENGINE=InnoDB;

-- Alter Promotions Table
ALTER TABLE promotions ADD COLUMN campaign_id BIGINT NULL;
ALTER TABLE promotions ADD COLUMN code VARCHAR(50) NULL UNIQUE;
ALTER TABLE promotions ADD COLUMN max_discount DECIMAL(15,2) NULL;
ALTER TABLE promotions ADD COLUMN min_order DECIMAL(15,2) NULL;
ALTER TABLE promotions ADD COLUMN applicable_ticket_types VARCHAR(255) NULL;
ALTER TABLE promotions ADD COLUMN applicable_membership_tier VARCHAR(100) NULL;
ALTER TABLE promotions ADD COLUMN valid_time VARCHAR(100) NULL;
ALTER TABLE promotions ADD CONSTRAINT fk_promotion_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id);

-- Alter Coupons Table
ALTER TABLE coupons ADD COLUMN expiration_date DATE NULL;
ALTER TABLE coupons ADD COLUMN customer_id BIGINT NULL;
ALTER TABLE coupons ADD CONSTRAINT fk_coupon_customer FOREIGN KEY (customer_id) REFERENCES customers(id);

-- Create Vouchers Table
CREATE TABLE vouchers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    voucher_value DECIMAL(15,2) NOT NULL,
    remaining_balance DECIMAL(15,2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    customer_id BIGINT NULL,
    status VARCHAR(30) NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    CONSTRAINT fk_voucher_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB;

-- Create Voucher Usages Table
CREATE TABLE voucher_usages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voucher_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    booking_id BIGINT NULL,
    amount_used DECIMAL(15,2) NOT NULL,
    used_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_usage_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
    CONSTRAINT fk_usage_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB;

-- Add indexes
CREATE INDEX idx_campaign_code ON campaigns(code);
CREATE INDEX idx_voucher_code ON vouchers(code);
CREATE INDEX idx_voucher_customer ON vouchers(customer_id);
CREATE INDEX idx_voucher_usage_voucher ON voucher_usages(voucher_id);
