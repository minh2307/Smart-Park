CREATE TABLE visitors (
    id BIGINT NOT NULL AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    identification_number VARCHAR(50) NOT NULL,
    relationship VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    medical_notes TEXT,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Seed some mock visitors to match frontend expectation
INSERT INTO visitors (id, customer_id, full_name, age, gender, nationality, identification_number, relationship, status, emergency_contact_name, emergency_contact_phone, medical_notes, created_at, updated_at) VALUES
(1, 1, 'Billy Davis', 9, 'MALE', 'American', 'CH-9023812', 'CHILD', 'ACTIVE', 'Emily Davis', '+1 415-555-2671', 'Peanut allergy, carries EpiPen', '2026-01-16 09:00:00', '2026-01-16 09:00:00'),
(2, 1, 'Arthur Davis', 42, 'MALE', 'American', 'PASS-89230198', 'SPOUSE', 'ACTIVE', 'Emily Davis', '+1 415-555-2671', 'No medical conditions reported', '2026-01-16 09:05:00', '2026-01-16 09:05:00'),
(3, 2, 'Mai Nguyen', 32, 'FEMALE', 'Vietnamese', 'ID-079188001234', 'SPOUSE', 'ACTIVE', 'Liam Nguyen', '+84 908-123-456', 'Asthma, sensitive to dust', '2026-02-11 08:00:00', '2026-02-11 08:00:00'),
(4, 2, 'Minh Nguyen', 5, 'MALE', 'Vietnamese', 'ID-079203009988', 'CHILD', 'ACTIVE', 'Mai Nguyen', '+84 908-123-456', NULL, '2026-02-11 08:10:00', '2026-02-11 08:10:00'),
(5, 3, 'Abuela Martinez', 72, 'FEMALE', 'Mexican', 'PASS-98730128', 'PARENT', 'ACTIVE', 'Sophia Martinez', '+1 212-555-8930', 'Difficulty walking long distances, requires wheelchair accessibility assistance', '2026-03-06 10:00:00', '2026-03-06 10:00:00');
