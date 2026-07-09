-- ============================================================================
-- SYSTEM: SMART PARK - ENTERPRISE DATABASE SCHEMA (MySQL)
-- Align with Java JPA Entities and SRS Section 6.1 (43 tables)
-- Target Database: smartpark_db
-- ============================================================================

CREATE DATABASE IF NOT EXISTS smartpark_db;
USE smartpark_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    failed_login_attempts INT DEFAULT 0,
    locked_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. permissions
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 5. role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 6. customers
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    birth_date DATE,
    gender VARCHAR(10),
    address VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. employees
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    salary DECIMAL(15, 2),
    hire_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. departments
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(200),
    manager_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 9. employee_departments
CREATE TABLE IF NOT EXISTS employee_departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 10. parks
CREATE TABLE IF NOT EXISTS parks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(300),
    description TEXT,
    max_capacity INT,
    open_time TIME,
    close_time TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 11. zones
CREATE TABLE IF NOT EXISTS zones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    park_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    max_capacity INT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE
);

-- 12. ride_categories
CREATE TABLE IF NOT EXISTS ride_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. rides
CREATE TABLE IF NOT EXISTS rides (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    zone_id BIGINT NOT NULL,
    ride_category_id BIGINT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    capacity INT NOT NULL,
    min_height DOUBLE,
    max_height DOUBLE,
    duration_seconds INT,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    FOREIGN KEY (ride_category_id) REFERENCES ride_categories(id) ON DELETE SET NULL
);

-- 14. ride_schedules
CREATE TABLE IF NOT EXISTS ride_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ride_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 15. ride_capacities
CREATE TABLE IF NOT EXISTS ride_capacities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ride_id BIGINT NOT NULL,
    time_slot TIME NOT NULL,
    max_capacity INT NOT NULL,
    booked_count INT NOT NULL DEFAULT 0,
    current_waiting_count INT NOT NULL DEFAULT 0,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
);

-- 16. ride_maintenances
CREATE TABLE IF NOT EXISTS ride_maintenances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ride_id BIGINT NOT NULL,
    technician_id BIGINT,
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    description TEXT,
    notes TEXT,
    cost DECIMAL(15, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 17. ride_inspections
CREATE TABLE IF NOT EXISTS ride_inspections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ride_id BIGINT NOT NULL,
    inspector_id BIGINT NOT NULL,
    inspection_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- PASS / FAIL
    result_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 18. ticket_types
CREATE TABLE IF NOT EXISTS ticket_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    park_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    standard_price DECIMAL(15, 2) NOT NULL,
    min_price DECIMAL(15, 2),
    max_price DECIMAL(15, 2),
    type VARCHAR(30) NOT NULL, -- STANDARD, VIP, FAMILY, ANNUAL
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE
);

-- 19. ticket_pricings
CREATE TABLE IF NOT EXISTS ticket_pricings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_type_id BIGINT NOT NULL,
    date DATE NOT NULL,
    dynamic_price DECIMAL(15, 2) NOT NULL,
    override_reason VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE
);

-- 20. bookings
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    booking_code VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(15, 2),
    expires_at DATETIME,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 21. orders
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT,
    customer_id BIGINT NOT NULL,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    subtotal DECIMAL(15, 2),
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- 22. order_items
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- TICKET, FOOD, RETAIL, LOCKER
    reference_id BIGINT,
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 23. tickets
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_item_id BIGINT,
    ticket_type_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    ticket_code VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'UNUSED', -- UNUSED, USED, EXPIRED, CANCELLED
    valid_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 24. check_ins
CREATE TABLE IF NOT EXISTS check_ins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    zone_id BIGINT NOT NULL,
    scanner_id VARCHAR(50),
    check_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- 25. payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    provider VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- 26. payments
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    payment_method_id BIGINT NOT NULL,
    transaction_reference VARCHAR(100),
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_time DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE
);

-- 27. membership_tiers
CREATE TABLE IF NOT EXISTS membership_tiers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    discount_percentage DECIMAL(5, 2),
    points_multiplier DECIMAL(5, 2) DEFAULT 1.00,
    min_spend DECIMAL(15, 2)
);

-- 28. memberships
CREATE TABLE IF NOT EXISTS memberships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    tier_id BIGINT NOT NULL,
    membership_code VARCHAR(50) NOT NULL UNIQUE,
    points BIGINT NOT NULL DEFAULT 0,
    join_date DATE NOT NULL,
    expiration_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (tier_id) REFERENCES membership_tiers(id) ON DELETE CASCADE
);

-- 29. promotions
CREATE TABLE IF NOT EXISTS promotions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE / FIXED_AMOUNT
    value DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 30. coupons
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    promotion_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    max_uses INT NOT NULL,
    current_uses INT NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);

-- 31. food_courts
CREATE TABLE IF NOT EXISTS food_courts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    park_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE
);

-- 32. food_stalls
CREATE TABLE IF NOT EXISTS food_stalls (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    food_court_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_court_id) REFERENCES food_courts(id) ON DELETE CASCADE
);

-- 33. food_items
CREATE TABLE IF NOT EXISTS food_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    food_stall_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_stall_id) REFERENCES food_stalls(id) ON DELETE CASCADE
);

-- 34. retail_shops
CREATE TABLE IF NOT EXISTS retail_shops (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    park_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE
);

-- 35. retail_items
CREATE TABLE IF NOT EXISTS retail_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    retail_shop_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(15, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (retail_shop_id) REFERENCES retail_shops(id) ON DELETE CASCADE
);

-- 36. parking_lots
CREATE TABLE IF NOT EXISTS parking_lots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    park_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    total_spaces INT NOT NULL,
    occupied_spaces INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE
);

-- 37. parking_transactions
CREATE TABLE IF NOT EXISTS parking_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parking_lot_id BIGINT NOT NULL,
    vehicle_plate VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL, -- MOTORBIKE, CAR, etc.
    entry_time DATETIME NOT NULL,
    exit_time DATETIME,
    amount_paid DECIMAL(15, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'PARKED',
    FOREIGN KEY (parking_lot_id) REFERENCES parking_lots(id) ON DELETE CASCADE
);

-- 38. lockers
CREATE TABLE IF NOT EXISTS lockers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    zone_id BIGINT NOT NULL,
    locker_code VARCHAR(20) NOT NULL UNIQUE,
    size VARCHAR(20) NOT NULL, -- SMALL, MEDIUM, LARGE
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- 39. locker_transactions
CREATE TABLE IF NOT EXISTS locker_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    locker_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    amount_paid DECIMAL(15, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (locker_id) REFERENCES lockers(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 40. feedbacks
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    category VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL,
    assigned_employee_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 41. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL, -- EMAIL, SMS, PUSH, IN_APP
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 42. incidents
CREATE TABLE IF NOT EXISTS incidents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    zone_id BIGINT NOT NULL,
    reporter_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    resolution_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- 43. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
    target_table VARCHAR(100) NOT NULL,
    record_id BIGINT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 1;