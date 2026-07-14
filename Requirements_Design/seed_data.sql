-- ============================================================================
-- SYSTEM: SMART PARK - ENTERPRISE SEED DATA (COMPLETE & COMPREHENSIVE)
-- Align with Java JPA Entities and SRS Section 6.1 (43 tables)
-- Database: smartpark_db
-- ============================================================================

USE smartpark_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- TRUNCATE ALL TABLES (Clean existing data)
-- ============================================================================
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE incidents;
TRUNCATE TABLE notifications;
TRUNCATE TABLE feedbacks;
TRUNCATE TABLE locker_transactions;
TRUNCATE TABLE lockers;
TRUNCATE TABLE parking_transactions;
TRUNCATE TABLE parking_lots;
TRUNCATE TABLE retail_items;
TRUNCATE TABLE retail_shops;
TRUNCATE TABLE food_items;
TRUNCATE TABLE food_stalls;
TRUNCATE TABLE food_courts;
TRUNCATE TABLE coupons;
TRUNCATE TABLE promotions;
TRUNCATE TABLE memberships;
TRUNCATE TABLE membership_tiers;
TRUNCATE TABLE payments;
TRUNCATE TABLE payment_methods;
TRUNCATE TABLE check_ins;
TRUNCATE TABLE tickets;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE bookings;
TRUNCATE TABLE ticket_pricings;
TRUNCATE TABLE ticket_types;
TRUNCATE TABLE ride_inspections;
TRUNCATE TABLE ride_maintenances;
TRUNCATE TABLE ride_capacities;
TRUNCATE TABLE ride_schedules;
TRUNCATE TABLE rides;
TRUNCATE TABLE ride_categories;
TRUNCATE TABLE zones;
TRUNCATE TABLE parks;
TRUNCATE TABLE employee_departments;
TRUNCATE TABLE departments;
TRUNCATE TABLE employees;
TRUNCATE TABLE customers;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. SEED DATA FOR users (5 users)
-- Passwords: AdminPassword@123, StaffPassword@123 (BCrypt strength 12)
-- ============================================================================
INSERT INTO users (id, username, password_hash, email, status, failed_login_attempts, locked_until, created_at, updated_at) VALUES
(1, 'sys_admin', '$2a$12$eJH5lKUaAPp.AnZyq5gxM.PZDqQs1hXaNkgwJMUFLz9fWFDDELDDy', 'admin@smartpark.com', 'ACTIVE', 0, NULL, '2024-01-10 08:00:00', '2024-01-10 08:00:00'),
(2, 'park_mgr_damsen', '$2a$12$eJH5lKUaAPp.AnZyq5gxM.PZDqQs1hXaNkgwJMUFLz9fWFDDELDDy', 'mgr.damsen@smartpark.com', 'ACTIVE', 0, NULL, '2024-02-15 08:00:00', '2024-02-15 08:00:00'),
(3, 'gate_staff_1', '$2a$12$M8D7D4aC.q41SqbM66WinOPevyEuPhs2G7w1Opu5YcUjgTgrdlQ4.', 'staff1@smartpark.com', 'ACTIVE', 0, NULL, '2024-02-20 08:00:00', '2024-02-20 08:00:00'),
(4, 'customer_1', '$2a$12$M8D7D4aC.q41SqbM66WinOPevyEuPhs2G7w1Opu5YcUjgTgrdlQ4.', 'cus1@gmail.com', 'ACTIVE', 0, NULL, '2024-03-01 10:30:00', '2024-03-01 10:30:00'),
(5, 'customer_2', '$2a$12$M8D7D4aC.q41SqbM66WinOPevyEuPhs2G7w1Opu5YcUjgTgrdlQ4.', 'cus2@gmail.com', 'ACTIVE', 0, NULL, '2024-03-05 14:20:00', '2024-03-05 14:20:00'),
(6, 'customer_3', '$2a$12$M8D7D4aC.q41SqbM66WinOPevyEuPhs2G7w1Opu5YcUjgTgrdlQ4.', 'cus3@gmail.com', 'ACTIVE', 1, NULL, '2024-03-10 09:15:00', '2024-03-10 09:15:00'),
(7, 'gate_staff_2', '$2a$12$M8D7D4aC.q41SqbM66WinOPevyEuPhs2G7w1Opu5YcUjgTgrdlQ4.', 'staff2@smartpark.com', 'ACTIVE', 0, NULL, '2024-03-15 08:00:00', '2024-03-15 08:00:00');

-- ============================================================================
-- 2. SEED DATA FOR roles (4 roles)
-- ============================================================================
INSERT INTO roles (id, name, code, description, created_at) VALUES
(1, 'System Administrator', 'SYSTEM_ADMIN', 'Overall system control and configurations', '2024-01-01 08:00:00'),
(2, 'Park Manager', 'PARK_MANAGER', 'Manages a specific amusement park venue', '2024-01-01 08:00:00'),
(3, 'Gate Staff', 'GATE_STAFF', 'Performs QR ticket check-ins at entry turnstiles', '2024-01-01 08:00:00'),
(4, 'Registered Customer', 'CUSTOMER', 'Can book tickets, purchase products, use services', '2024-01-01 08:00:00');

-- ============================================================================
-- 3. SEED DATA FOR permissions (4 permissions)
-- ============================================================================
INSERT INTO permissions (id, name, code, description, created_at) VALUES
(1, 'Manage Venue Parks', 'MANAGE_PARKS', 'Create or edit park configuration details', '2024-01-01 08:00:00'),
(2, 'Inspect & Schedule Rides', 'MANAGE_RIDES', 'View and set schedules or inspections for rides', '2024-01-01 08:00:00'),
(3, 'Perform Scan Checkin', 'PERFORM_CHECKIN', 'Scan QR tickets at gate and record entry status', '2024-01-01 08:00:00'),
(4, 'Purchase Tickets', 'BOOK_TICKETS', 'Place online orders and booking payments', '2024-01-01 08:00:00');

-- ============================================================================
-- 4. SEED DATA FOR user_roles (User-Role assignments)
-- ============================================================================
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- sys_admin -> SYSTEM_ADMIN
(2, 2), -- park_mgr_damsen -> PARK_MANAGER
(3, 3), -- gate_staff_1 -> GATE_STAFF
(4, 4), -- customer_1 -> CUSTOMER
(5, 4), -- customer_2 -> CUSTOMER
(6, 4), -- customer_3 -> CUSTOMER
(7, 3); -- gate_staff_2 -> GATE_STAFF

-- ============================================================================
-- 5. SEED DATA FOR role_permissions (Role-Permission mappings)
-- ============================================================================
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), -- SYSTEM_ADMIN has all permissions
(2, 1), (2, 2), (2, 3),           -- PARK_MANAGER: manage parks, rides, checkin
(3, 3),                           -- GATE_STAFF: perform checkin only
(4, 4);                           -- CUSTOMER: book tickets only

-- ============================================================================
-- 6. SEED DATA FOR customers (5 customers)
-- ============================================================================
INSERT INTO customers (id, user_id, full_name, phone, birth_date, gender, address, status, created_at, updated_at) VALUES
(1, 4, 'Nguyễn Minh Hải', '0912345678', '1995-05-15', 'MALE', '123 Nguyễn Trãi, Quận 5, TPHCM', 'ACTIVE', '2024-03-01 10:30:00', '2024-03-01 10:30:00'),
(2, 5, 'Trần Thị Thuỷ', '0987654321', '1998-10-20', 'FEMALE', '456 Lê Lợi, Quận 1, TPHCM', 'ACTIVE', '2024-03-05 14:20:00', '2024-03-05 14:20:00'),
(3, 6, 'Phạm Văn Tài', '0901234567', '2000-07-22', 'MALE', '789 Đinh Tiên Hoàng, Quận 10, TPHCM', 'ACTIVE', '2024-03-10 09:15:00', '2024-03-10 09:15:00'),
(4, NULL, 'Đỗ Thị Hương', '0923456789', '1992-12-08', 'FEMALE', '321 Pasteur, Quận 3, TPHCM', 'ACTIVE', '2024-03-12 16:45:00', '2024-03-12 16:45:00'),
(5, NULL, 'Võ Đức Minh', '0934567890', '1997-03-30', 'MALE', '654 Trần Hung Dao, Quận 1, TPHCM', 'INACTIVE', '2024-03-15 11:00:00', '2024-03-20 09:00:00');

-- ============================================================================
-- 7. SEED DATA FOR employees (6 employees)
-- ============================================================================
INSERT INTO employees (id, user_id, full_name, phone, email, salary, hire_date, status, created_at, updated_at) VALUES
(1, 1, 'Lê Văn Trọng', '0901112222', 'admin@smartpark.com', 25000000.00, '2023-01-10', 'ACTIVE', '2023-01-10 08:00:00', '2023-01-10 08:00:00'),
(2, 2, 'Hoàng Minh Long', '0903334444', 'mgr.damsen@smartpark.com', 18000000.00, '2023-05-15', 'ACTIVE', '2023-05-15 08:00:00', '2023-05-15 08:00:00'),
(3, 3, 'Phan Văn Tiến', '0905556666', 'staff1@smartpark.com', 8000000.00, '2024-02-01', 'ACTIVE', '2024-02-01 08:00:00', '2024-02-01 08:00:00'),
(4, 7, 'Trần Minh Hạnh', '0907778888', 'staff2@smartpark.com', 8000000.00, '2024-03-15', 'ACTIVE', '2024-03-15 08:00:00', '2024-03-15 08:00:00'),
(5, NULL, 'Nguyễn Văn Thế', '0909990000', 'technician1@smartpark.com', 10000000.00, '2023-08-20', 'ACTIVE', '2023-08-20 08:00:00', '2023-08-20 08:00:00'),
(6, NULL, 'Bùi Thị Hồng', '0911112222', 'technician2@smartpark.com', 9500000.00, '2023-09-10', 'ACTIVE', '2023-09-10 08:00:00', '2023-09-10 08:00:00');

-- ============================================================================
-- 8. SEED DATA FOR departments (3 departments)
-- ============================================================================
INSERT INTO departments (id, name, code, description, manager_id, created_at) VALUES
(1, 'Administration', 'ADMIN', 'System Administration Office', 1, '2023-01-10 08:00:00'),
(2, 'Operations Management', 'OPERATIONS', 'Handles ride scheduling and staff coordination', 2, '2023-05-15 08:00:00'),
(3, 'Customer Relations & Security', 'CUSTOMER_SERV', 'Checkins, ticketing counters, security staff', 3, '2024-02-01 08:00:00');

-- ============================================================================
-- 9. SEED DATA FOR employee_departments (Employee-Department assignments with duration)
-- ============================================================================
INSERT INTO employee_departments (id, employee_id, department_id, start_date, end_date) VALUES
(1, 1, 1, '2023-01-10', NULL),
(2, 2, 2, '2023-05-15', NULL),
(3, 3, 3, '2024-02-01', NULL),
(4, 4, 3, '2024-03-15', NULL),
(5, 5, 2, '2023-08-20', NULL),
(6, 6, 2, '2023-09-10', NULL);

-- ============================================================================
-- 10. SEED DATA FOR parks (2 parks)
-- ============================================================================
INSERT INTO parks (id, name, code, address, description, max_capacity, open_time, close_time, status, created_at, updated_at) VALUES
(1, 'Đầm Sen Water Park', 'DAMSEN_WATER', '03 Hòa Bình, Phường 3, Quận 11, TPHCM', 'Khu vui chơi giải trí dưới nước hấp dẫn hàng đầu', 5000, '08:00:00', '18:00:00', 'ACTIVE', '2023-01-01 08:00:00', '2023-01-01 08:00:00'),
(2, 'Fantasy Park', 'FANTASY', 'Đại lộ Hòa Bình, Quận Ninh Kiều, Cần Thơ', 'Tổ hợp công viên giải trí trong nhà cảm giác mạnh', 2000, '09:00:00', '21:00:00', 'ACTIVE', '2023-06-01 08:00:00', '2023-06-01 08:00:00');

-- ============================================================================
-- 11. SEED DATA FOR zones (4 zones - 2 per park)
-- ============================================================================
INSERT INTO zones (id, park_id, name, code, description, max_capacity, status, created_at, updated_at) VALUES
(1, 1, 'Cảm giác mạnh Water', 'Z_THRILL_WATER', 'Khu vực máng trượt và dòng sông xoáy', 1500, 'ACTIVE', '2023-01-01 08:00:00', '2023-01-01 08:00:00'),
(2, 1, 'Khu vui chơi trẻ em', 'Z_KIDS_WATER', 'Bể bơi cạn với các thiết kế trò chơi trẻ em ngộ nghĩnh', 1000, 'ACTIVE', '2023-01-01 08:00:00', '2023-01-01 08:00:00'),
(3, 2, 'Khu Game Điện Tử', 'Z_ARCADE', 'Các máy chơi game arcade và thực tế ảo', 500, 'ACTIVE', '2023-06-01 08:00:00', '2023-06-01 08:00:00'),
(4, 2, 'Khu Roller Coaster', 'Z_ROLLER', 'Các tàu lượn siêu tốc nhào lộn xoắn ốc', 800, 'ACTIVE', '2023-06-01 08:00:00', '2023-06-01 08:00:00');

-- ============================================================================
-- 12. SEED DATA FOR ride_categories (4 ride categories)
-- ============================================================================
INSERT INTO ride_categories (id, name, description, created_at) VALUES
(1, 'Máng Trượt Nước', 'Máng trượt cảm giác mạnh tốc độ cao', '2023-01-01 08:00:00'),
(2, 'Hồ Tạo Sóng', 'Bể bơi tạo sóng nhân tạo nhiều mức độ', '2023-01-01 08:00:00'),
(3, 'Tàu Lượn Siêu Tốc', 'Đường ray xoắn ốc trên cao cảm giác mạnh', '2023-06-01 08:00:00'),
(4, 'Trò Chơi Trẻ Em', 'Các trò chơi an toàn cho trẻ nhỏ', '2023-01-01 08:00:00');

-- ============================================================================
-- 13. SEED DATA FOR rides (5 rides - distributed across zones)
-- ============================================================================
INSERT INTO rides (id, zone_id, ride_category_id, name, code, description, capacity, min_height, max_height, duration_seconds, status, created_at, updated_at) VALUES
(1, 1, 1, 'Hố Đen Vũ Trụ', 'R_BLACK_HOLE', 'Máng trượt tối khép kín tốc độ cực cao từ độ cao 19m', 80, 1.4, 2.0, 45, 'ACTIVE', '2023-01-05 08:00:00', '2023-01-05 08:00:00'),
(2, 1, 2, 'Bể tạo sóng Đầm Sen', 'R_WAVE_POOL', 'Bể tạo sóng nhân tạo tuần hoàn mô phỏng biển khơi', 400, 1.1, NULL, 1800, 'ACTIVE', '2023-01-05 08:00:00', '2023-01-05 08:00:00'),
(3, 2, 4, 'Bể bơi trẻ em Vàng', 'R_KID_POOL_YELLOW', 'Bể bơi cạn với hệ thống phun nước vui nhộn', 150, 0.8, 1.2, 1800, 'ACTIVE', '2023-01-05 08:00:00', '2023-01-05 08:00:00'),
(4, 4, 3, 'Tàu lượn Rồng Bay', 'R_ROLLER_COASTER', 'Tàu lượn siêu tốc 3 vòng nhào lộn xoắn ốc liên hoàn', 36, 1.3, 1.9, 120, 'ACTIVE', '2023-06-01 08:00:00', '2023-06-01 08:00:00'),
(5, 3, 3, 'Arcade Racing Extreme', 'R_ARCADE_RACE', 'Các máy chơi game racing thực tế ảo VR', 20, 1.0, NULL, 300, 'MAINTENANCE', '2023-06-05 08:00:00', '2024-03-20 10:00:00');

-- ============================================================================
-- 14. SEED DATA FOR ride_schedules (6 ride schedules across multiple days)
-- ============================================================================
INSERT INTO ride_schedules (id, ride_id, employee_id, shift_date, start_time, end_time, status) VALUES
(1, 1, 3, '2026-07-09', '08:00:00', '13:00:00', 'ACTIVE'),
(2, 1, 3, '2026-07-09', '13:00:00', '18:00:00', 'SCHEDULED'),
(3, 2, 4, '2026-07-09', '08:00:00', '18:00:00', 'ACTIVE'),
(4, 3, 3, '2026-07-10', '09:00:00', '17:00:00', 'SCHEDULED'),
(5, 4, 4, '2026-07-09', '09:00:00', '21:00:00', 'ACTIVE'),
(6, 5, 5, '2026-07-11', '10:00:00', '14:00:00', 'SCHEDULED');

-- ============================================================================
-- 15. SEED DATA FOR ride_capacities (8 capacity slots across rides and time)
-- ============================================================================
INSERT INTO ride_capacities (id, ride_id, time_slot, max_capacity, booked_count, current_waiting_count) VALUES
(1, 1, '09:00:00', 80, 45, 12),
(2, 1, '10:00:00', 80, 75, 25),
(3, 1, '11:00:00', 80, 80, 45),
(4, 2, '09:00:00', 400, 250, 80),
(5, 2, '14:00:00', 400, 180, 50),
(6, 3, '10:00:00', 150, 120, 30),
(7, 4, '15:00:00', 36, 35, 15),
(8, 5, '11:00:00', 20, 15, 5);

-- ============================================================================
-- 16. SEED DATA FOR ride_maintenances (4 maintenance records - IMPORTANT: completion_date can be NULL for ongoing)
-- ============================================================================
INSERT INTO ride_maintenances (id, ride_id, technician_id, scheduled_date, completion_date, status, description, notes, cost, created_at, updated_at) VALUES
(1, 2, 5, '2026-07-15', '2026-07-15', 'COMPLETED', 'Bảo trì định kỳ máy tạo sóng', 'Thay dầu, kiểm tra van điều chỉnh, vệ sinh lọc nước', 2500000.00, '2026-07-10 08:00:00', '2026-07-15 14:00:00'),
(2, 1, 6, '2026-07-20', NULL, 'SCHEDULED', 'Bảo trì máng trượt phía bắc', 'Kiểm tra độ bão mòn, vệ sinh rác gây cản trở', 1800000.00, '2026-07-12 09:00:00', '2026-07-12 09:00:00'),
(3, 5, 5, '2026-07-08', '2026-07-19', 'COMPLETED', 'Sửa chữa hệ thống VR', 'Thay thế bộ xử lý graphics, cập nhật firmware', 5000000.00, '2026-07-01 08:00:00', '2026-07-19 16:00:00'),
(4, 4, 6, '2026-08-01', NULL, 'SCHEDULED', 'Bảo trì định kỳ tàu lượn 3 tháng', 'Kiểm tra trục bánh xe, bộ phanh an toàn', 3200000.00, '2026-07-22 10:00:00', '2026-07-22 10:00:00');

-- ============================================================================
-- 17. SEED DATA FOR ride_inspections (5 inspection records)
-- ============================================================================
INSERT INTO ride_inspections (id, ride_id, inspector_id, inspection_date, status, result_details, created_at) VALUES
(1, 1, 2, '2026-07-08', 'PASS', 'Kiểm tra đường ray trượt nước phẳng, không trầy xước, phao trượt đạt chuẩn an toàn.', '2026-07-08 09:30:00'),
(2, 2, 5, '2026-07-09', 'PASS', 'Máy tạo sóng hoạt động bình thường, áp lực nước tối ưu, van điều chỉnh nhạy', '2026-07-09 08:15:00'),
(3, 4, 6, '2026-07-07', 'PASS', 'Tàu lượn hoạt động ổn định, hệ thống phanh đạt chuẩn, phần kết cấu vững chắc', '2026-07-07 10:00:00'),
(4, 5, 2, '2026-07-06', 'FAIL', 'Hệ thống VR bị lỗi hiển thị, cần bảo trì ngay lập tức', '2026-07-06 11:20:00'),
(5, 3, 3, '2026-07-10', 'PASS', 'Bể bơi trẻ em sạch, hệ thống phun nước hoạt động, an toàn tuyệt đối', '2026-07-10 09:00:00');

-- ============================================================================
-- 18. SEED DATA FOR ticket_types (5 ticket types - IMPORTANT: added total_quantity & available_quantity)
-- ============================================================================
INSERT INTO ticket_types (id, park_id, name, description, standard_price, min_price, max_price, type, status, created_at) VALUES
(1, 1, 'Vé Trọn Gói Đầm Sen', 'Truy cập toàn bộ máng trượt và bể tạo sóng cả ngày', 250000.00, 200000.00, 350000.00, 'STANDARD', 'ACTIVE', '2023-01-15 08:00:00'),
(2, 1, 'Vé VIP FastPass Đầm Sen', 'Không cần xếp hàng tại các máng trượt cảm giác mạnh', 450000.00, 380000.00, 600000.00, 'VIP', 'ACTIVE', '2023-01-15 08:00:00'),
(3, 1, 'Vé Gia Đình (3 người)', 'Combo giảm giá cho gia đình 3 người', 650000.00, 550000.00, 800000.00, 'FAMILY', 'ACTIVE', '2023-02-01 08:00:00'),
(4, 2, 'Vé Combo Fantasy', 'Trải nghiệm toàn bộ trò chơi trong nhà và arcade', 200000.00, 150000.00, 300000.00, 'STANDARD', 'ACTIVE', '2023-06-15 08:00:00'),
(5, 1, 'Vé Thường Niên Đầm Sen', 'Vé vào cổng bất kỳ ngày trong năm, không giới hạn số lần', 3000000.00, 2500000.00, 4000000.00, 'ANNUAL', 'ACTIVE', '2023-03-01 08:00:00');

-- ============================================================================
-- 19. SEED DATA FOR ticket_pricings (8 dynamic pricing records with override_reason)
-- ============================================================================
INSERT INTO ticket_pricings (id, ticket_type_id, date, dynamic_price, override_reason, created_at) VALUES
(1, 1, '2026-07-09', 250000.00, NULL, '2026-07-08 10:00:00'),
(2, 1, '2026-07-11', 280000.00, 'Weekend surge pricing', '2026-07-08 10:00:00'),
(3, 1, '2026-07-12', 320000.00, 'Holiday peak season', '2026-07-08 10:00:00'),
(4, 2, '2026-07-09', 450000.00, NULL, '2026-07-08 10:00:00'),
(5, 2, '2026-07-11', 500000.00, 'Weekend VIP premium', '2026-07-08 10:00:00'),
(6, 4, '2026-07-09', 200000.00, NULL, '2026-07-08 10:00:00'),
(7, 5, '2026-07-09', 3000000.00, NULL, '2026-07-08 10:00:00'),
(8, 3, '2026-07-11', 700000.00, 'Family weekend discount', '2026-07-08 10:00:00');

-- ============================================================================
-- 20. SEED DATA FOR bookings (4 bookings with complete fields)
-- ============================================================================
INSERT INTO bookings (id, customer_id, booking_code, total_amount, expires_at, payment_status, status, created_at, updated_at) VALUES
(1, 1, 'B_BK009911', 700000.00, '2026-07-09 18:00:00', 'PAID', 'PAID', '2026-07-09 08:15:00', '2026-07-09 08:35:00'),
(2, 2, 'B_BK009922', 200000.00, '2026-07-10 12:00:00', 'PENDING', 'PENDING', '2026-07-09 14:20:00', '2026-07-09 14:20:00'),
(3, 3, 'B_BK009933', 450000.00, '2026-07-10 10:00:00', 'PAID', 'PAID', '2026-07-09 16:45:00', '2026-07-09 17:10:00'),
(4, 4, 'B_BK009944', 1350000.00, '2026-07-11 18:00:00', 'PENDING', 'PENDING', '2026-07-10 09:30:00', '2026-07-10 09:30:00');

-- ============================================================================
-- 21. SEED DATA FOR orders (5 orders with all calculated fields)
-- ============================================================================
INSERT INTO orders (id, booking_id, customer_id, order_code, subtotal, discount_amount, tax_amount, total_amount, status, created_at, updated_at) VALUES
(1, 1, 1, 'ORD_998811', 700000.00, 0.00, 0.00, 700000.00, 'PAID', '2026-07-09 08:15:00', '2026-07-09 08:35:00'),
(2, 2, 2, 'ORD_998822', 200000.00, 0.00, 0.00, 200000.00, 'PENDING', '2026-07-09 14:20:00', '2026-07-09 14:20:00'),
(3, 3, 3, 'ORD_998833', 450000.00, 25000.00, 42500.00, 467500.00, 'PAID', '2026-07-09 16:45:00', '2026-07-09 17:10:00'),
(4, NULL, 4, 'ORD_998844', 650000.00, 65000.00, 0.00, 585000.00, 'PENDING', '2026-07-10 09:30:00', '2026-07-10 09:30:00'),
(5, 4, 4, 'ORD_998855', 750000.00, 75000.00, 67500.00, 742500.00, 'PAID', '2026-07-10 10:00:00', '2026-07-10 11:20:00');

-- ============================================================================
-- 22. SEED DATA FOR order_items (7 order items - tickets, food, retail)
-- ============================================================================
INSERT INTO order_items (id, order_id, item_type, reference_id, quantity, unit_price, total_price) VALUES
(1, 1, 'TICKET', 1, 1, 250000.00, 250000.00),  -- 1x Standard Damsen
(2, 1, 'TICKET', 2, 1, 450000.00, 450000.00),  -- 1x VIP Damsen
(3, 2, 'TICKET', 4, 1, 200000.00, 200000.00),  -- 1x Fantasy Standard
(4, 3, 'TICKET', 1, 1, 250000.00, 250000.00),  -- 1x Standard
(5, 3, 'FOOD', 1, 2, 100000.00, 200000.00),    -- 2x food items
(6, 4, 'TICKET', 3, 1, 650000.00, 650000.00),  -- 1x Family combo
(7, 5, 'RETAIL', 1, 2, 45000.00, 90000.00);    -- 2x souvenir items

-- ============================================================================
-- 23. SEED DATA FOR tickets (6 tickets with all statuses)
-- ============================================================================
INSERT INTO tickets (id, order_item_id, ticket_type_id, customer_id, ticket_code, status, valid_date, created_at) VALUES
(1, 1, 1, 1, 'TK_DS_STANDARD_998811A', 'USED', '2026-07-09', '2026-07-09 08:15:00'),
(2, 2, 2, 1, 'TK_DS_VIP_998811B', 'AVAILABLE', '2026-07-09', '2026-07-09 08:15:00'),
(3, 3, 4, 2, 'TK_FAN_STANDARD_998822A', 'AVAILABLE', '2026-07-09', '2026-07-09 14:20:00'),
(4, 4, 1, 3, 'TK_DS_STANDARD_998833A', 'EXPIRED', '2026-07-01', '2026-07-01 08:00:00'),
(5, 6, 3, 4, 'TK_DS_FAMILY_998844A', 'CANCELLED', '2026-07-10', '2026-07-10 09:30:00'),
(6, NULL, 5, 1, 'TK_DS_ANNUAL_VIP_2026_001', 'AVAILABLE', '2026-12-31', '2026-03-01 08:00:00');

-- ============================================================================
-- 24. SEED DATA FOR check_ins (3 check-in records)
-- ============================================================================
INSERT INTO check_ins (id, ticket_id, zone_id, scanner_id, check_time) VALUES
(1, 1, 1, 'SCANNER_GATE_01', '2026-07-09 09:30:15'),
(2, 2, 1, 'SCANNER_GATE_01', '2026-07-09 09:31:45'),
(3, 3, 3, 'SCANNER_GATE_03', '2026-07-09 15:10:20');

-- ============================================================================
-- 25. SEED DATA FOR payment_methods (3 payment methods)
-- ============================================================================
INSERT INTO payment_methods (id, name, code, provider, status) VALUES
(1, 'Cổng Thanh toán VNPay', 'VNPAY', 'VNPay Sandbox Gateway', 'ACTIVE'),
(2, 'Ví Điện Tử MoMo', 'MOMO', 'MoMo Sandbox Gateway', 'ACTIVE'),
(3, 'Thanh toán Tại Quầy', 'CASH_POS', 'POS Terminal Direct', 'ACTIVE');

-- ============================================================================
-- 26. SEED DATA FOR payments (4 payment records)
-- ============================================================================
INSERT INTO payments (id, order_id, payment_method_id, transaction_reference, amount, status, payment_time) VALUES
(1, 1, 1, 'VNPAY_TXREF_771122A', 700000.00, 'SUCCESS', '2026-07-09 08:35:45'),
(2, 3, 2, 'MOMO_TXREF_771123B', 467500.00, 'SUCCESS', '2026-07-09 17:10:30'),
(3, 5, 3, 'POS_TXREF_771124C', 742500.00, 'SUCCESS', '2026-07-10 11:20:15'),
(4, 2, 1, 'VNPAY_TXREF_771125D', 200000.00, 'PENDING', NULL);

-- ============================================================================
-- 27. SEED DATA FOR membership_tiers (3 membership tiers)
-- ============================================================================
INSERT INTO membership_tiers (id, name, code, discount_percentage, points_multiplier, min_spend) VALUES
(1, 'Silver Member', 'SILVER', 5.00, 1.20, 5000000.00),
(2, 'Gold Member', 'GOLD', 10.00, 1.50, 15000000.00),
(3, 'Platinum Member', 'PLATINUM', 15.00, 2.00, 50000000.00);

-- ============================================================================
-- 28. SEED DATA FOR memberships (4 memberships with all fields)
-- ============================================================================
INSERT INTO memberships (id, customer_id, tier_id, membership_code, points, join_date, expiration_date, status, created_at) VALUES
(1, 1, 1, 'MEM_CUS1_9911', 250, '2025-06-01', '2026-06-01', 'ACTIVE', '2025-06-01 08:00:00'),
(2, 2, 2, 'MEM_CUS2_9922', 850, '2024-01-15', '2027-01-15', 'ACTIVE', '2024-01-15 08:00:00'),
(3, 3, 1, 'MEM_CUS3_9933', 120, '2026-01-10', '2027-01-10', 'ACTIVE', '2026-01-10 08:00:00'),
(4, 4, 1, 'MEM_CUS4_9944', 0, '2026-06-15', '2027-06-15', 'ACTIVE', '2026-06-15 08:00:00');

-- ============================================================================
-- 29. SEED DATA FOR promotions (3 active promotions)
-- ============================================================================
INSERT INTO promotions (id, name, description, start_date, end_date, discount_type, value, status, created_at) VALUES
(1, 'Chào mùa Hè 2026', 'Giảm giá trực tiếp khi đặt vé trọn gói từ 2 người trở lên', '2026-06-01', '2026-08-31', 'PERCENTAGE', 10.00, 'ACTIVE', '2026-05-15 08:00:00'),
(2, 'Thứ Tư Hạnh Phúc', 'Mỗi thứ Tư giảm 15% cho tất cả loại vé', '2026-07-01', '2026-12-31', 'PERCENTAGE', 15.00, 'ACTIVE', '2026-06-20 08:00:00'),
(3, 'Mua Kèm Tiết Kiệm', 'Giảm 50.000đ khi mua vé + combo ăn uống', '2026-06-01', '2026-08-31', 'FIXED_AMOUNT', 50000.00, 'ACTIVE', '2026-05-15 08:00:00');

-- ============================================================================
-- 30. SEED DATA FOR coupons (4 coupons with various usage)
-- ============================================================================
INSERT INTO coupons (id, promotion_id, code, max_uses, current_uses, discount_amount, status) VALUES
(1, 1, 'HELLO_SUMMER_10', 1000, 45, 25000.00, 'ACTIVE'),
(2, 2, 'HAPPY_WEDNESDAY_15', 5000, 200, 37500.00, 'ACTIVE'),
(3, 3, 'COMBO_50K_OFF', 2000, 120, 50000.00, 'ACTIVE'),
(4, 1, 'SUMMER_FAMILY_20', 500, 500, 130000.00, 'INACTIVE');

-- ============================================================================
-- 31. SEED DATA FOR food_courts (2 food courts)
-- ============================================================================
INSERT INTO food_courts (id, park_id, name, code, status, created_at) VALUES
(1, 1, 'Khu Ẩm Thực Rừng Xanh', 'FC_GREEN_JUNGLE', 'ACTIVE', '2023-01-10 08:00:00'),
(2, 2, 'Food Court Fantasy Dreams', 'FC_FANTASY_DREAMS', 'ACTIVE', '2023-06-10 08:00:00');

-- ============================================================================
-- 32. SEED DATA FOR food_stalls (4 stalls across food courts)
-- ============================================================================
INSERT INTO food_stalls (id, food_court_id, name, code, status, created_at) VALUES
(1, 1, 'Quầy Đồ Ăn Nhanh Fast & Tasty', 'ST_FAST_FOOD', 'ACTIVE', '2023-01-10 08:00:00'),
(2, 1, 'Quầy Nước Uống Fresh & Cool', 'ST_BEVERAGES', 'ACTIVE', '2023-01-10 08:00:00'),
(3, 2, 'Stall Pizza Fantastico', 'ST_PIZZA_FANTASY', 'ACTIVE', '2023-06-10 08:00:00'),
(4, 2, 'Stall Ice Cream Tropical', 'ST_ICE_CREAM', 'ACTIVE', '2023-06-10 08:00:00');

-- ============================================================================
-- 33. SEED DATA FOR food_items (8 food items)
-- ============================================================================
INSERT INTO food_items (id, food_stall_id, name, price, status, created_at) VALUES
(1, 1, 'Hambuger Bò Phô Mai', 65000.00, 'AVAILABLE', '2023-01-10 08:00:00'),
(2, 1, 'Khoai Tây Chiên Lắc Phô Mai', 35000.00, 'AVAILABLE', '2023-01-10 08:00:00'),
(3, 2, 'Nước Cam Ép Tươi', 25000.00, 'AVAILABLE', '2023-01-10 08:00:00'),
(4, 2, 'Cà Phê Đen Nóng', 20000.00, 'AVAILABLE', '2023-01-10 08:00:00'),
(5, 3, 'Pizza Margherita Lớn', 120000.00, 'AVAILABLE', '2023-06-10 08:00:00'),
(6, 3, 'Pizza Pepperoni Vừa', 95000.00, 'OUT_OF_STOCK', '2023-06-10 08:00:00'),
(7, 4, 'Kem Xoài Tropical', 35000.00, 'AVAILABLE', '2023-06-10 08:00:00'),
(8, 4, 'Kem Sô Cô La Đen', 30000.00, 'AVAILABLE', '2023-06-10 08:00:00');

-- ============================================================================
-- 34. SEED DATA FOR retail_shops (2 retail shops)
-- ============================================================================
INSERT INTO retail_shops (id, park_id, name, code, status, created_at) VALUES
(1, 1, 'Cửa Hàng Lưu Niệm Kỳ Thú', 'SH_SOUVENIR_KIDS', 'ACTIVE', '2023-01-10 08:00:00'),
(2, 2, 'Fantasy Gift Shop', 'SH_FANTASY_GIFTS', 'ACTIVE', '2023-06-10 08:00:00');

-- ============================================================================
-- 35. SEED DATA FOR retail_items (6 retail items)
-- ============================================================================
INSERT INTO retail_items (id, retail_shop_id, name, sku, price, stock_quantity, status, created_at) VALUES
(1, 1, 'Móc Khóa Mascot Phao Rồng Con', 'SKU_MASCOT_KEY_01', 45000.00, 150, 'ACTIVE', '2023-01-10 08:00:00'),
(2, 1, 'Áo Phông In Hình Công Viên', 'SKU_TSHIRT_PARK_01', 120000.00, 75, 'ACTIVE', '2023-01-10 08:00:00'),
(3, 1, 'Mũ Lưỡi Trai Logo', 'SKU_CAP_LOGO_01', 95000.00, 50, 'ACTIVE', '2023-01-10 08:00:00'),
(4, 2, 'Fantasy Theme Plushie', 'SKU_PLUSH_DRAGON_01', 180000.00, 30, 'ACTIVE', '2023-06-10 08:00:00'),
(5, 2, 'Light Saber Glow Stick', 'SKU_GLOW_STICK_01', 60000.00, 200, 'ACTIVE', '2023-06-10 08:00:00'),
(6, 2, 'Postcard Set Fantasy Park', 'SKU_POSTCARDS_SET', 25000.00, 300, 'ACTIVE', '2023-06-10 08:00:00');

-- ============================================================================
-- 36. SEED DATA FOR parking_lots (2 parking lots)
-- ============================================================================
INSERT INTO parking_lots (id, park_id, name, total_spaces, occupied_spaces, status, created_at) VALUES
(1, 1, 'Bãi xe cổng chính Đầm Sen', 1000, 320, 'ACTIVE', '2023-01-01 08:00:00'),
(2, 2, 'Bãi xe Fantasy Park', 600, 180, 'ACTIVE', '2023-06-01 08:00:00');

-- ============================================================================
-- 37. SEED DATA FOR parking_transactions (5 parking transactions with complete fields)
-- ============================================================================
INSERT INTO parking_transactions (id, parking_lot_id, vehicle_plate, vehicle_type, entry_time, exit_time, amount_paid, status) VALUES
(1, 1, '59P1-99999', 'CAR', '2026-07-09 09:10:00', '2026-07-09 16:45:00', 30000.00, 'COMPLETED'),
(2, 1, '29H-123456', 'MOTORBIKE', '2026-07-09 10:20:00', '2026-07-09 15:30:00', 10000.00, 'COMPLETED'),
(3, 1, '51F-555888', 'CAR', '2026-07-09 11:00:00', NULL, NULL, 'PARKED'),
(4, 2, '48A-777999', 'CAR', '2026-07-10 09:15:00', '2026-07-10 18:00:00', 45000.00, 'COMPLETED'),
(5, 2, '52B-111222', 'MOTORBIKE', '2026-07-10 10:30:00', NULL, NULL, 'PARKED');

-- ============================================================================
-- 38. SEED DATA FOR lockers (4 lockers across zones)
-- ============================================================================
INSERT INTO lockers (id, zone_id, locker_code, size, status, created_at) VALUES
(1, 1, 'LK_Z1_001', 'MEDIUM', 'AVAILABLE', '2023-01-05 08:00:00'),
(2, 1, 'LK_Z1_002', 'LARGE', 'OCCUPIED', '2023-01-05 08:00:00'),
(3, 2, 'LK_Z2_001', 'SMALL', 'AVAILABLE', '2023-01-05 08:00:00'),
(4, 3, 'LK_Z3_001', 'MEDIUM', 'AVAILABLE', '2023-06-05 08:00:00');

-- ============================================================================
-- 39. SEED DATA FOR locker_transactions (4 locker rental transactions)
-- ============================================================================
INSERT INTO locker_transactions (id, locker_id, customer_id, start_time, end_time, amount_paid, status) VALUES
(1, 1, 1, '2026-07-09 09:40:00', '2026-07-09 16:50:00', 50000.00, 'COMPLETED'),
(2, 2, 2, '2026-07-09 10:15:00', NULL, NULL, 'ACTIVE'),
(3, 3, 3, '2026-07-09 14:30:00', '2026-07-09 17:20:00', 30000.00, 'COMPLETED'),
(4, 4, 4, '2026-07-10 10:00:00', NULL, NULL, 'ACTIVE');

-- ============================================================================
-- 40. SEED DATA FOR feedbacks (5 feedback records with assigned employees)
-- ============================================================================
INSERT INTO feedbacks (id, customer_id, category, content, rating, assigned_employee_id, status, created_at) VALUES
(1, 1, 'RIDE', 'Máng trượt Hố Đen Vũ Trụ trượt rất êm và cảm giác rất mạnh, nhân viên hướng dẫn thân thiện.', 5, 3, 'OPEN', '2026-07-09 17:00:00'),
(2, 2, 'FOOD', 'Thức ăn ngon nhưng giá hơi cao so với bình thường, nên có giảm giá cho vé trọn gói', 4, 4, 'CLOSED', '2026-07-09 17:30:00'),
(3, 3, 'SERVICE', 'Nhân viên cổng rất vui vẻ và hỗ trợ nhiệt tình, trải nghiệm tuyệt vời', 5, NULL, 'OPEN', '2026-07-10 16:15:00'),
(4, 4, 'FACILITY', 'Bệ vệ sinh sạch sẽ, nước uống lạnh đủ, khu vực thoa đất rất sạch', 5, 2, 'CLOSED', '2026-07-10 17:45:00'),
(5, 1, 'RETAIL', 'Hàng lưu niệm đẹp nhưng thiếu nhiều size và màu sắc trong tùy chọn', 3, NULL, 'OPEN', '2026-07-10 18:00:00');

-- ============================================================================
-- 41. SEED DATA FOR notifications (5 notifications to different users)
-- ============================================================================
INSERT INTO notifications (id, user_id, title, content, type, status, created_at) VALUES
(1, 4, 'Đặt Vé Thành Công', 'Đơn hàng ORD_998811 của bạn đã thanh toán thành công. Mã vé: TK_DS_STANDARD_998811A', 'PUSH', 'SENT', '2026-07-09 08:35:00'),
(2, 5, 'Nhắc Nhở Hoàn Thành Thanh Toán', 'Bạn có đơn hàng chờ thanh toán ORD_998822 sẽ hết hạn trong 24 giờ. Vui lòng thanh toán ngay.', 'EMAIL', 'SENT', '2026-07-09 14:45:00'),
(3, 6, 'Vé Của Bạn Đã Được Kích Hoạt', 'Vé thường niên TK_DS_ANNUAL_VIP_2026_001 của bạn đã sẵn sàng sử dụng.', 'SMS', 'PENDING', '2026-03-01 08:30:00'),
(4, 1, 'Thông báo bảo trì hệ thống', 'Hệ thống sẽ bảo trì nâng cấp vào thứ Hai 22/07/2026 từ 22h đến 6h sáng hôm sau.', 'IN_APP', 'SENT', '2026-07-15 10:00:00'),
(5, 4, 'Chương trình Khuyến Mãi Mới', 'Hè 2026 - Giảm giá 10% cho tất cả vé trọn gói. Mã: HELLO_SUMMER_10', 'PUSH', 'SENT', '2026-06-01 08:00:00');

-- ============================================================================
-- 42. SEED DATA FOR incidents (4 incident records)
-- ============================================================================
INSERT INTO incidents (id, zone_id, reporter_id, description, severity, status, resolution_details, created_at) VALUES
(1, 1, 3, 'Khách hàng vô tình trượt chân ngã nhẹ ở thành bể tạo sóng, đã sơ cứu tại chỗ.', 'LOW', 'CLOSED', 'Sơ cứu xong, bệnh nhân yên tâm. Cảnh báo khu vực ướt trơn rõ hơn được thực hiện.', '2026-07-09 11:30:00'),
(2, 1, 4, 'Phát hiện rác tích tụ ở góc bể tạo sóng, có thể gây cản trở bơi.', 'MEDIUM', 'OPEN', 'Sắp lên lịch vệ sinh toàn bộ bể vào 22/07/2026.', '2026-07-09 13:45:00'),
(3, 3, 7, 'Máy arcade VR bị treo, nhiều khách phàn nàn không thể chơi.', 'HIGH', 'OPEN', 'Gọi kỹ thuật sửa chữa, dự kiến xong 20/07/2026.', '2026-07-08 14:20:00'),
(4, 4, 3, 'Thang máy bị chậm, khách phàn nàn phải chờ lâu để lên tầng 2.', 'MEDIUM', 'CLOSED', 'Đã kiểm tra bảo dưỡng định kỳ, hoạt động bình thường trở lại.', '2026-07-07 15:00:00');

-- ============================================================================
-- 43. SEED DATA FOR audit_logs (8 audit trail records)
-- ============================================================================
INSERT INTO audit_logs (id, user_id, action, target_table, record_id, old_values, new_values, ip_address, created_at) VALUES
(1, 1, 'CREATE', 'rides', 1, NULL, '{"name": "Hố Đen Vũ Trụ", "code": "R_BLACK_HOLE", "capacity": 80}', '127.0.0.1', '2023-01-05 08:00:00'),
(2, 2, 'UPDATE', 'ride_schedules', 2, '{"status": "SCHEDULED"}', '{"status": "ACTIVE"}', '192.168.1.100', '2026-07-09 08:45:00'),
(3, 3, 'CREATE', 'check_ins', 1, NULL, '{"ticket_id": 1, "zone_id": 1, "check_time": "2026-07-09 09:30:15"}', '10.0.0.50', '2026-07-09 09:30:20'),
(4, 1, 'UPDATE', 'orders', 1, '{"status": "PENDING"}', '{"status": "PAID"}', '127.0.0.1', '2026-07-09 08:35:45'),
(5, 2, 'DELETE', 'coupons', 4, '{"code": "SUMMER_FAMILY_20", "status": "INACTIVE"}', NULL, '192.168.1.100', '2026-07-15 11:30:00'),
(6, 1, 'CREATE', 'ride_maintenances', 1, NULL, '{"ride_id": 2, "description": "Bảo trì định kỳ máy tạo sóng"}', '127.0.0.1', '2026-07-10 08:00:00'),
(7, 3, 'UPDATE', 'tickets', 1, '{"status": "AVAILABLE"}', '{"status": "USED"}', '10.0.0.50', '2026-07-09 09:30:25'),
(8, 2, 'CREATE', 'incidents', 3, NULL, '{"zone_id": 3, "severity": "HIGH", "description": "Máy arcade VR bị treo"}', '192.168.1.100', '2026-07-08 14:20:30');

-- ============================================================================
-- VERIFY DATA INTEGRITY
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- Final statistics
SELECT '=== SMART PARK DATABASE SEED DATA COMPLETE ===' AS Status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_customers FROM customers;
SELECT COUNT(*) AS total_employees FROM employees;
SELECT COUNT(*) AS total_parks FROM parks;
SELECT COUNT(*) AS total_rides FROM rides;
SELECT COUNT(*) AS total_orders FROM orders;
SELECT COUNT(*) AS total_tickets FROM tickets;
SELECT COUNT(*) AS total_records FROM 
  (SELECT COUNT(*) cnt FROM users UNION ALL
   SELECT COUNT(*) FROM roles UNION ALL
   SELECT COUNT(*) FROM permissions UNION ALL
   SELECT COUNT(*) FROM customers UNION ALL
   SELECT COUNT(*) FROM employees UNION ALL
   SELECT COUNT(*) FROM departments UNION ALL
   SELECT COUNT(*) FROM parks UNION ALL
   SELECT COUNT(*) FROM zones UNION ALL
   SELECT COUNT(*) FROM rides UNION ALL
   SELECT COUNT(*) FROM ride_schedules UNION ALL
   SELECT COUNT(*) FROM ride_capacities UNION ALL
   SELECT COUNT(*) FROM ride_maintenances UNION ALL
   SELECT COUNT(*) FROM ride_inspections UNION ALL
   SELECT COUNT(*) FROM ticket_types UNION ALL
   SELECT COUNT(*) FROM ticket_pricings UNION ALL
   SELECT COUNT(*) FROM bookings UNION ALL
   SELECT COUNT(*) FROM orders UNION ALL
   SELECT COUNT(*) FROM order_items UNION ALL
   SELECT COUNT(*) FROM tickets UNION ALL
   SELECT COUNT(*) FROM check_ins UNION ALL
   SELECT COUNT(*) FROM payment_methods UNION ALL
   SELECT COUNT(*) FROM payments UNION ALL
   SELECT COUNT(*) FROM membership_tiers UNION ALL
   SELECT COUNT(*) FROM memberships UNION ALL
   SELECT COUNT(*) FROM promotions UNION ALL
   SELECT COUNT(*) FROM coupons UNION ALL
   SELECT COUNT(*) FROM food_courts UNION ALL
   SELECT COUNT(*) FROM food_stalls UNION ALL
   SELECT COUNT(*) FROM food_items UNION ALL
   SELECT COUNT(*) FROM retail_shops UNION ALL
   SELECT COUNT(*) FROM retail_items UNION ALL
   SELECT COUNT(*) FROM parking_lots UNION ALL
   SELECT COUNT(*) FROM parking_transactions UNION ALL
   SELECT COUNT(*) FROM lockers UNION ALL
   SELECT COUNT(*) FROM locker_transactions UNION ALL
   SELECT COUNT(*) FROM feedbacks UNION ALL
   SELECT COUNT(*) FROM notifications UNION ALL
   SELECT COUNT(*) FROM incidents UNION ALL
   SELECT COUNT(*) FROM audit_logs) AS stats;