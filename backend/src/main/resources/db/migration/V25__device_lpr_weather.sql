-- Device authentication, turnstile idempotency, LPR evidence and weather locations.
CREATE TABLE iot_devices (
 id BIGINT NOT NULL AUTO_INCREMENT,
 device_code VARCHAR(80) NOT NULL,
 device_type ENUM('TURNSTILE','LPR_CAMERA') NOT NULL,
 park_id BIGINT NOT NULL,
 zone_id BIGINT NULL,
 gate_id BIGINT NULL,
 status ENUM('ACTIVE','INACTIVE','REVOKED') NOT NULL DEFAULT 'INACTIVE',
 credential_hash VARCHAR(255) NOT NULL,
 last_seen_at DATETIME(6) NULL,
 created_at DATETIME(6) NOT NULL,
 updated_at DATETIME(6) NOT NULL,
 version BIGINT NOT NULL DEFAULT 0,
 PRIMARY KEY(id), UNIQUE KEY uk_iot_device_code(device_code),
 KEY idx_iot_device_type_status(device_type,status), KEY idx_iot_device_park(park_id),
 CONSTRAINT fk_iot_device_park FOREIGN KEY(park_id) REFERENCES parks(id),
 CONSTRAINT fk_iot_device_zone FOREIGN KEY(zone_id) REFERENCES zones(id),
 CONSTRAINT fk_iot_device_gate FOREIGN KEY(gate_id) REFERENCES gates(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE turnstile_scan_events (
 id BIGINT NOT NULL AUTO_INCREMENT, device_id BIGINT NOT NULL, ticket_id BIGINT NULL,
 request_id VARCHAR(64) NOT NULL, ticket_code VARCHAR(100) NOT NULL, park_id BIGINT NOT NULL, zone_id BIGINT NULL,
 decision VARCHAR(20) NOT NULL, command VARCHAR(20) NOT NULL, ticket_status VARCHAR(30) NULL,
 error_code VARCHAR(40) NULL, message VARCHAR(255) NULL, scan_time DATETIME(6) NOT NULL,
 processed_at DATETIME(6) NOT NULL, latency_ms BIGINT NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY uk_turnstile_device_request(device_id,request_id),
 KEY idx_turnstile_ticket_time(ticket_code,processed_at), KEY idx_turnstile_decision_time(decision,processed_at),
 CONSTRAINT fk_turnstile_device FOREIGN KEY(device_id) REFERENCES iot_devices(id),
 CONSTRAINT fk_turnstile_ticket FOREIGN KEY(ticket_id) REFERENCES tickets(id),
 CONSTRAINT fk_turnstile_park FOREIGN KEY(park_id) REFERENCES parks(id),
 CONSTRAINT fk_turnstile_zone FOREIGN KEY(zone_id) REFERENCES zones(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE parking_transactions ADD COLUMN entry_image_reference VARCHAR(500) NULL;
ALTER TABLE parking_transactions ADD COLUMN exit_image_reference VARCHAR(500) NULL;
ALTER TABLE parking_transactions ADD COLUMN entry_device_id BIGINT NULL;
ALTER TABLE parking_transactions ADD COLUMN exit_device_id BIGINT NULL;
ALTER TABLE parking_transactions ADD COLUMN entry_recognition_confidence DECIMAL(5,4) NULL;
ALTER TABLE parking_transactions ADD COLUMN exit_recognition_confidence DECIMAL(5,4) NULL;
CREATE INDEX idx_pt_lot_plate_status ON parking_transactions(parking_lot_id,vehicle_plate,status);
ALTER TABLE parking_transactions ADD CONSTRAINT fk_pt_entry_device FOREIGN KEY(entry_device_id) REFERENCES iot_devices(id);
ALTER TABLE parking_transactions ADD CONSTRAINT fk_pt_exit_device FOREIGN KEY(exit_device_id) REFERENCES iot_devices(id);

CREATE TABLE lpr_scan_events (
 id BIGINT NOT NULL AUTO_INCREMENT, device_id BIGINT NOT NULL, parking_lot_id BIGINT NOT NULL,
 parking_transaction_id BIGINT NULL, request_id VARCHAR(64) NOT NULL, direction VARCHAR(10) NOT NULL,
 plate_number VARCHAR(20) NULL, confidence DECIMAL(5,4) NULL, image_reference VARCHAR(500) NOT NULL,
 decision VARCHAR(20) NOT NULL, barrier_command VARCHAR(20) NOT NULL, error_code VARCHAR(40) NULL,
 captured_at DATETIME(6) NOT NULL, processed_at DATETIME(6) NOT NULL, latency_ms BIGINT NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY uk_lpr_device_request(device_id,request_id),
 KEY idx_lpr_plate_time(plate_number,processed_at), KEY idx_lpr_lot_direction(parking_lot_id,direction,processed_at),
 CONSTRAINT fk_lpr_device FOREIGN KEY(device_id) REFERENCES iot_devices(id),
 CONSTRAINT fk_lpr_lot FOREIGN KEY(parking_lot_id) REFERENCES parking_lots(id),
 CONSTRAINT fk_lpr_transaction FOREIGN KEY(parking_transaction_id) REFERENCES parking_transactions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE parks ADD COLUMN latitude DECIMAL(10,7) NULL;
ALTER TABLE parks ADD COLUMN longitude DECIMAL(10,7) NULL;
ALTER TABLE parks ADD COLUMN timezone VARCHAR(50) NULL;
ALTER TABLE parks ADD COLUMN weather_location_code VARCHAR(100) NULL;

INSERT INTO permissions(name,code,description,created_at) VALUES
 ('View Gate Operations','GATE_VIEW','View turnstile operations',NOW(6)),
 ('Control Gates','GATE_CONTROL','Process turnstile gate decisions',NOW(6)),
 ('View Parking','PARKING_VIEW','View parking operations',NOW(6)),
 ('Manage Parking','PARKING_MANAGE','Process LPR parking entry and exit',NOW(6)),
 ('View Weather','WEATHER_VIEW','View park weather forecasts',NOW(6))
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT IGNORE INTO role_permissions(role_id,permission_id)
 SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
 WHERE r.code='SYSTEM_ADMIN' AND p.code IN('GATE_VIEW','GATE_CONTROL','PARKING_VIEW','PARKING_MANAGE','WEATHER_VIEW');
INSERT IGNORE INTO role_permissions(role_id,permission_id)
 SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
 WHERE r.code='PARK_MANAGER' AND p.code IN('GATE_VIEW','GATE_CONTROL','PARKING_VIEW','PARKING_MANAGE','WEATHER_VIEW');
INSERT IGNORE INTO role_permissions(role_id,permission_id)
 SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
 WHERE r.code IN('OPERATIONS_STAFF','GATE_STAFF') AND p.code IN('GATE_VIEW','GATE_CONTROL','PARKING_VIEW','PARKING_MANAGE','WEATHER_VIEW');
INSERT IGNORE INTO role_permissions(role_id,permission_id)
 SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
 WHERE r.code='SALES_STAFF' AND p.code='WEATHER_VIEW';
