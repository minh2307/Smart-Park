-- ============================================================
-- V14: Parking Area (alter), Gate (new), Parking Session (alter)
-- Smart Park – Parking & Gate Management Module
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. ALTER parking_lots → thêm fields cho ParkingArea spec
-- ──────────────────────────────────────────────────────────
ALTER TABLE parking_lots ADD COLUMN vehicle_type ENUM('MOTORBIKE','CAR','TRUCK','ALL') NOT NULL DEFAULT 'ALL';
ALTER TABLE parking_lots ADD COLUMN hourly_rate  DECIMAL(15,2) NULL;
ALTER TABLE parking_lots ADD COLUMN daily_rate   DECIMAL(15,2) NULL;
ALTER TABLE parking_lots ADD COLUMN description  TEXT          NULL;
ALTER TABLE parking_lots ADD COLUMN updated_at   DATETIME(6)   NULL;
ALTER TABLE parking_lots ADD COLUMN deleted_at   DATETIME(6)   NULL;

ALTER TABLE parking_lots ADD INDEX idx_parking_lots_status (status);
ALTER TABLE parking_lots ADD INDEX idx_parking_lots_vehicle_type (vehicle_type);

-- ──────────────────────────────────────────────────────────
-- 2. CREATE gates
-- ──────────────────────────────────────────────────────────
CREATE TABLE gates
(
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    parking_area_id BIGINT       NULL COMMENT 'FK → parking_lots.id (nullable)',
    zone_id         BIGINT       NULL COMMENT 'FK → zones.id',
    code            VARCHAR(50)  NOT NULL COMMENT 'Unique gate code, e.g. GATE_MAIN_01',
    name            VARCHAR(150) NOT NULL,
    type            ENUM('ENTRANCE','EXIT','BIDIRECTIONAL') NOT NULL DEFAULT 'ENTRANCE',
    status          ENUM('OPEN','CLOSED','MAINTENANCE')     NOT NULL DEFAULT 'OPEN',
    description     TEXT         NULL,
    device_info     VARCHAR(500) NULL COMMENT 'JSON: connected devices list',
    created_at      DATETIME(6)  NULL,
    updated_at      DATETIME(6)  NULL,
    deleted_at      DATETIME(6)  NULL COMMENT 'Soft delete timestamp',
    PRIMARY KEY (id),
    UNIQUE KEY uk_gate_code (code),
    INDEX idx_gate_status (status),
    INDEX idx_gate_type (type),
    INDEX idx_gate_parking_area (parking_area_id),
    INDEX idx_gate_zone (zone_id),
    CONSTRAINT fk_gate_parking_area FOREIGN KEY (parking_area_id) REFERENCES parking_lots (id),
    CONSTRAINT fk_gate_zone FOREIGN KEY (zone_id) REFERENCES zones (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 3. ALTER parking_transactions → thêm fields cho ParkingSession spec
-- ──────────────────────────────────────────────────────────
ALTER TABLE parking_transactions ADD COLUMN entry_gate_id  BIGINT                                    NULL;
ALTER TABLE parking_transactions ADD COLUMN exit_gate_id   BIGINT                                    NULL;
ALTER TABLE parking_transactions ADD COLUMN parking_fee    DECIMAL(15, 2)                            NULL;
ALTER TABLE parking_transactions ADD COLUMN payment_status ENUM('UNPAID','PAID','WAIVED') NOT NULL DEFAULT 'UNPAID';
ALTER TABLE parking_transactions ADD COLUMN notes          VARCHAR(500)                              NULL;

ALTER TABLE parking_transactions ADD INDEX idx_pt_vehicle_plate (vehicle_plate);
ALTER TABLE parking_transactions ADD INDEX idx_pt_status (status);
ALTER TABLE parking_transactions ADD INDEX idx_pt_entry_time (entry_time);
ALTER TABLE parking_transactions ADD INDEX idx_pt_payment_status (payment_status);
ALTER TABLE parking_transactions ADD INDEX idx_pt_entry_gate (entry_gate_id);
ALTER TABLE parking_transactions ADD INDEX idx_pt_exit_gate (exit_gate_id);
ALTER TABLE parking_transactions ADD CONSTRAINT fk_pt_entry_gate FOREIGN KEY (entry_gate_id) REFERENCES gates (id);
ALTER TABLE parking_transactions ADD CONSTRAINT fk_pt_exit_gate FOREIGN KEY (exit_gate_id) REFERENCES gates (id);
