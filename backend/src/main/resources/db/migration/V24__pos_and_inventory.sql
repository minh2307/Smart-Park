ALTER TABLE retail_items ADD COLUMN reserved_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE retail_items ADD COLUMN low_stock_threshold INT NOT NULL DEFAULT 0;
ALTER TABLE retail_items ADD COLUMN updated_at DATETIME(6) NULL;
ALTER TABLE retail_items ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE retail_items ADD CONSTRAINT chk_retail_stock_nonnegative CHECK (stock_quantity >= 0);
ALTER TABLE retail_items ADD CONSTRAINT chk_retail_reserved_valid CHECK (reserved_quantity >= 0 AND reserved_quantity <= stock_quantity);

CREATE INDEX idx_retail_shop_status ON retail_items(retail_shop_id, status);
CREATE INDEX idx_retail_stock_levels ON retail_items(stock_quantity, reserved_quantity, low_stock_threshold);

CREATE TABLE inventory_transactions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    retail_item_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    quantity_delta INT NOT NULL,
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    reserved_quantity_before INT NOT NULL,
    reserved_quantity_after INT NOT NULL,
    reference_type VARCHAR(30) NULL,
    reference_id BIGINT NULL,
    reason VARCHAR(80) NOT NULL,
    note VARCHAR(500) NULL,
    created_by BIGINT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_inventory_tx_item FOREIGN KEY (retail_item_id) REFERENCES retail_items(id),
    CONSTRAINT fk_inventory_tx_shop FOREIGN KEY (shop_id) REFERENCES retail_shops(id),
    CONSTRAINT fk_inventory_tx_user FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT chk_inventory_tx_quantities CHECK (quantity_before >= 0 AND quantity_after >= 0 AND reserved_quantity_before >= 0 AND reserved_quantity_after >= 0)
) ENGINE=InnoDB;
CREATE INDEX idx_inventory_tx_item_created ON inventory_transactions(retail_item_id, created_at);
CREATE INDEX idx_inventory_tx_reference ON inventory_transactions(reference_type, reference_id);

CREATE TABLE pos_terminals (
    id BIGINT NOT NULL AUTO_INCREMENT,
    terminal_code VARCHAR(50) NOT NULL,
    park_id BIGINT NOT NULL,
    location VARCHAR(200) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_seen_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_pos_terminal_code UNIQUE (terminal_code),
    CONSTRAINT fk_pos_terminal_park FOREIGN KEY (park_id) REFERENCES parks(id)
) ENGINE=InnoDB;
CREATE INDEX idx_pos_terminal_park_status ON pos_terminals(park_id, status);

CREATE TABLE pos_idempotency_requests (
    id BIGINT NOT NULL AUTO_INCREMENT,
    scope VARCHAR(30) NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL,
    response_json TEXT NULL,
    resource_id BIGINT NULL,
    expires_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_pos_idempotency_scope_key UNIQUE (scope, idempotency_key)
) ENGINE=InnoDB;
CREATE INDEX idx_pos_idempotency_expiry ON pos_idempotency_requests(status, expires_at);

ALTER TABLE orders ADD COLUMN park_id BIGINT NULL;
ALTER TABLE orders ADD COLUMN terminal_id BIGINT NULL;
ALTER TABLE orders ADD COLUMN receipt_number VARCHAR(64) NULL;
ALTER TABLE orders ADD CONSTRAINT uk_orders_receipt_number UNIQUE (receipt_number);
ALTER TABLE orders ADD CONSTRAINT fk_orders_pos_park FOREIGN KEY (park_id) REFERENCES parks(id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_pos_terminal FOREIGN KEY (terminal_id) REFERENCES pos_terminals(id);
CREATE INDEX idx_orders_terminal_created ON orders(terminal_id, created_at);

ALTER TABLE order_items ADD COLUMN item_sku VARCHAR(50) NULL;
ALTER TABLE order_items ADD COLUMN item_name VARCHAR(200) NULL;

ALTER TABLE payments
    ADD CONSTRAINT uk_payments_transaction_reference UNIQUE (transaction_reference);

INSERT INTO payment_methods(name, code, provider, status)
SELECT 'Cash', 'CASH', 'CASH', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE code = 'CASH');

INSERT INTO permissions(name, code, description, created_at)
SELECT 'Create POS checkout', 'POS_CREATE', 'Process an atomic point-of-sale checkout', CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'POS_CREATE');
INSERT INTO permissions(name, code, description, created_at)
SELECT 'View retail inventory', 'RETAIL_VIEW', 'View retail inventory levels', CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'RETAIL_VIEW');
INSERT INTO permissions(name, code, description, created_at)
SELECT 'Update retail inventory', 'RETAIL_UPDATE', 'Adjust retail inventory with traceable history', CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'RETAIL_UPDATE');

INSERT INTO roles(name, code, description, created_at)
SELECT 'Sales Staff', 'SALES_STAFF', 'Operates POS terminals and retail inventory', CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = 'SALES_STAFF');

INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('POS_CREATE','RETAIL_VIEW','RETAIL_UPDATE')
WHERE r.code IN ('SYSTEM_ADMIN','PARK_MANAGER','SALES_STAFF')
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);
