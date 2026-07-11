-- ============================================================================
-- SYSTEM: SMART PARK - ENTERPRISE SEED DATA (MOCK DATA)
-- Align with Java JPA Entities and SRS Section 6.1 (43 tables)
-- Target Database: smartpark_db
-- ============================================================================

USE ticketing_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data
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

-- 1. SEED DATA FOR users
-- Passwords BCrypt hashed (AdminPassword@123 strength 12: $2a$12$eJH5lKUaAPp.AnZyq5gxM.PZDqQs1hXaNkgwJMUFLz9fWFDDELDDy)
-- (StaffPassword@123 strength 12: $2a$12$M8D7D4aC.q41SqbM66WinOPevyEuPhs2G7w1Opu5YcUjgTgrdlQ4.)
INSERT INTO users (id, username, password_hash, email, status, failed_login_attempts) VALUES
(1, 'sys_admin', '$2a$12$eJH5lKUaAPp.AnZyq5gxM.PZDqQs1hXaNkgwJMUFLz9fWFDDELDDy', 'admin@smartpark.com', 'ACTIVE', 0),
(2, 'park_mgr_damsen', '$2a$12$eJH5lKUaAPp.AnZyq5gxM.PZDqQs1hXaNkgwJMUFLz9fWFDDELDDy', 'mgr.damsen@smartpark.com', 'ACTIVE', 0),
(3, 'gate_staff_1', '$2a$12$M8D7D4aC.q41SqbM66WinOPevyEuPhs2G7w1Opu5YcUjgTgrdlQ4.', 'staff1@smartpark.com', 'ACTIVE', 0),
(4, 'customer_1', '$2a$12$M8D7D4aC.q41SqbM66WinOPevyEuPhs2G7w1Opu5YcUjgTgrdlQ4.', 'cus1@gmail.com', 'ACTIVE', 0),
(5, 'customer_2', '$2a$12$M8D7D4aC.q41SqbM66WinOPevyEuPhs2G7w1Opu5YcUjgTgrdlQ4.', 'cus2@gmail.com', 'ACTIVE', 0);

-- 2. SEED DATA FOR roles
INSERT INTO roles (id, name, code, description) VALUES
(1, 'System Administrator', 'SYSTEM_ADMIN', 'Overall system control and configurations'),
(2, 'Park Manager', 'PARK_MANAGER', 'Manages a specific amusement park venue'),
(3, 'Gate Staff', 'GATE_STAFF', 'Performs QR ticket check-ins at entry turnstiles'),
(4, 'Registered Customer', 'CUSTOMER', 'Can book tickets, purchase products, use services');

-- 3. SEED DATA FOR permissions
INSERT INTO permissions (id, name, code, description) VALUES
(1, 'Manage Venue Parks', 'MANAGE_PARKS', 'Create or edit park configuration details'),
(2, 'Inspect & Schedule Rides', 'MANAGE_RIDES', 'View and set schedules or inspections for rides'),
(3, 'Perform Scan Checkin', 'PERFORM_CHECKIN', 'Scan QR tickets at gate and record entry status'),
(4, 'Purchase Tickets', 'BOOK_TICKETS', 'Place online orders and booking payments');

-- 4. SEED DATA FOR user_roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 4);

-- 5. SEED DATA FOR role_permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3),
(3, 3),
(4, 4);

-- 6. SEED DATA FOR customers
INSERT INTO customers (id, user_id, full_name, phone, birth_date, gender, address, status) VALUES
(1, 4, 'Nguyễn Minh Hải', '0912345678', '1995-05-15', 'MALE', '123 Nguyễn Trãi, Quận 5, TPHCM', 'ACTIVE'),
(2, 5, 'Trần Thị Thuỷ', '0987654321', '1998-10-20', 'FEMALE', '456 Lê Lợi, Quận 1, TPHCM', 'ACTIVE');

-- 7. SEED DATA FOR employees
INSERT INTO employees (id, user_id, full_name, phone, email, salary, hire_date, status) VALUES
(1, 1, 'Lê Văn Trọng', '0901112222', 'admin@smartpark.com', 25000000.00, '2023-01-10', 'ACTIVE'),
(2, 2, 'Hoàng Minh Long', '0903334444', 'mgr.damsen@smartpark.com', 18000000.00, '2023-05-15', 'ACTIVE'),
(3, 3, 'Phan Văn Tiến', '0905556666', 'staff1@smartpark.com', 8000000.00, '2024-02-01', 'ACTIVE');

-- 8. SEED DATA FOR departments
INSERT INTO departments (id, name, code, description, manager_id) VALUES
(1, 'Administration', 'ADMIN', 'System Administration Office', 1),
(2, 'Operations Management', 'OPERATIONS', 'Handles ride scheduling and staff coordination', 2),
(3, 'Customer Relations & Security', 'CUSTOMER_SERV', 'Checkins, ticketing counters, security staff', 3);

-- 9. SEED DATA FOR employee_departments
INSERT INTO employee_departments (employee_id, department_id, start_date) VALUES
(1, 1, '2023-01-10'),
(2, 2, '2023-05-15'),
(3, 3, '2024-02-01');

-- 10. SEED DATA FOR parks
INSERT INTO parks (id, name, code, address, description, max_capacity, open_time, close_time, status) VALUES
(1, 'Đầm Sen Water Park', 'DAMSEN_WATER', '03 Hòa Bình, Phường 3, Quận 11, TPHCM', 'Khu vui chơi giải trí dưới nước hấp dẫn hàng đầu', 5000, '08:00:00', '18:00:00', 'ACTIVE'),
(2, 'Fantasy Park', 'FANTASY', 'Đại lộ Hòa Bình, Quận Ninh Kiều, Cần Thơ', 'Tổ hợp công viên giải trí trong nhà cảm giác mạnh', 2000, '09:00:00', '21:00:00', 'ACTIVE');

-- 11. SEED DATA FOR zones
INSERT INTO zones (id, park_id, name, code, description, max_capacity, status) VALUES
(1, 1, 'Cảm giác mạnh Water', 'Z_THRILL_WATER', 'Khu vực máng trượt và dòng sông xoáy', 1500, 'ACTIVE'),
(2, 1, 'Khu vui chơi trẻ em', 'Z_KIDS_WATER', 'Bể bơi cạn với các thiết kế trò chơi trẻ em ngộ nghĩnh', 1000, 'ACTIVE'),
(3, 2, 'Khu Game Điện Tử', 'Z_ARCADE', 'Các máy chơi game arcade và thực tế ảo', 500, 'ACTIVE');

-- 12. SEED DATA FOR ride_categories
INSERT INTO ride_categories (id, name, description) VALUES
(1, 'Máng Trượt Nước', 'Máng trượt cảm giác mạnh tốc độ cao'),
(2, 'Hồ Tạo Sóng', 'Bể bơi tạo sóng nhân tạo nhiều mức độ'),
(3, 'Tàu Lượn Siêu Tốc', 'Đường ray xoắn ốc trên cao cảm giác mạnh');

-- 13. SEED DATA FOR rides
INSERT INTO rides (id, zone_id, ride_category_id, name, code, description, capacity, min_height, max_height, duration_seconds, status) VALUES
(1, 1, 1, 'Hố Đen Vũ Trụ', 'R_BLACK_HOLE', 'Máng trượt tối khép kín tốc độ cực cao từ độ cao 19m', 80, 1.4, 2.0, 45, 'ACTIVE'),
(2, 1, 2, 'Bể tạo sóng Đầm Sen', 'R_WAVE_POOL', 'Bể tạo sóng nhân tạo tuần hoàn mô phỏng biển khơi', 400, 1.1, null, 1800, 'ACTIVE'),
(3, 3, 3, 'Tàu lượn Rồng Bay', 'R_ROLLER_COASTER', 'Tàu lượn siêu tốc 3 vòng nhào lộn xoắn ốc liên hoàn', 36, 1.3, 1.9, 120, 'ACTIVE');

-- 14. SEED DATA FOR ride_schedules
INSERT INTO ride_schedules (id, ride_id, employee_id, shift_date, start_time, end_time, status) VALUES
(1, 1, 3, '2026-07-09', '08:00:00', '13:00:00', 'ACTIVE'),
(2, 1, 3, '2026-07-09', '13:00:00', '18:00:00', 'SCHEDULED');

-- 15. SEED DATA FOR ride_capacities
INSERT INTO ride_capacities (id, ride_id, time_slot, max_capacity, booked_count, current_waiting_count) VALUES
(1, 1, '09:00:00', 80, 45, 12),
(2, 1, '10:00:00', 80, 75, 25);

-- 16. SEED DATA FOR ride_maintenances
INSERT INTO ride_maintenances (id, ride_id, technician_id, scheduled_date, start_time, end_time, status, description) VALUES
(1, 2, 2, '2026-07-15', '2026-07-15 08:00:00', '2026-07-15 12:00:00', 'SCHEDULED', 'Bảo trì định kỳ máy tạo sóng và hệ thống lọc nước tuần hoàn');

-- 17. SEED DATA FOR ride_inspections
INSERT INTO ride_inspections (id, ride_id, inspector_id, inspection_date, status, result_details) VALUES
(1, 1, 2, '2026-07-08', 'PASS', 'Kiểm tra đường ray trượt nước phẳng, không trầy xước, phao trượt đạt chuẩn an toàn.');

-- 18. SEED DATA FOR ticket_types
INSERT INTO ticket_types (id, park_id, name, description, standard_price, min_price, max_price, type, status, total_quantity, available_quantity) VALUES
(1, 1, 'Vé Trọn Gói Đầm Sen', 'Truy cập toàn bộ máng trượt và bể tạo sóng cả ngày', 250000.00, 200000.00, 350000.00, 'ADULT', 'ACTIVE', 1000, 1000),
(2, 1, 'Vé VIP FastPass Đầm Sen', 'Không cần xếp hàng tại các máng trượt cảm giác mạnh', 450000.00, 380000.00, 600000.00, 'VIP', 'ACTIVE', 500, 500),
(3, 2, 'Vé Combo Fantasy', 'Trải nghiệm toàn bộ trò chơi trong nhà và arcade', 200000.00, 150000.00, 300000.00, 'ADULT', 'ACTIVE', 1000, 1000);

-- 19. SEED DATA FOR ticket_pricings
INSERT INTO ticket_pricings (id, ticket_type_id, date, dynamic_price) VALUES
(1, 1, '2026-07-09', 250000.00),
(2, 1, '2026-07-11', 280000.00), -- Dynamic price weekend
(3, 2, '2026-07-09', 450000.00);

-- 20. SEED DATA FOR bookings
INSERT INTO bookings (id, customer_id, booking_code, total_amount, payment_status, status) VALUES
(1, 1, 'B_BK009911', 700000.00, 'PAID', 'PAID'),
(2, 2, 'B_BK009922', 200000.00, 'PENDING', 'PENDING');

-- 21. SEED DATA FOR orders
INSERT INTO orders (id, booking_id, customer_id, order_code, subtotal, discount_amount, tax_amount, total_amount, status) VALUES
(1, 1, 1, 'ORD_998811', 700000.00, 0.00, 0.00, 700000.00, 'PAID'),
(2, 2, 2, 'ORD_998822', 200000.00, 0.00, 0.00, 200000.00, 'PENDING');

-- 22. SEED DATA FOR order_items
INSERT INTO order_items (id, order_id, item_type, reference_id, quantity, unit_price, total_price) VALUES
(1, 1, 'TICKET', 1, 1, 250000.00, 250000.00), -- 1 Vé Standard
(2, 1, 'TICKET', 2, 1, 450000.00, 450000.00), -- 1 Vé VIP
(3, 2, 'TICKET', 3, 1, 200000.00, 200000.00);

-- 23. SEED DATA FOR tickets
INSERT INTO tickets (id, order_item_id, ticket_type_id, customer_id, ticket_code, status, valid_date) VALUES
(1, 1, 1, 1, 'TK_DS_STANDARD_998811A', 'USED', '2026-07-09'),
(2, 2, 2, 1, 'TK_DS_VIP_998811B', 'AVAILABLE', '2026-07-09');

-- 24. SEED DATA FOR check_ins
INSERT INTO check_ins (id, ticket_id, zone_id, scanner_id, check_time) VALUES
(1, 1, 1, 'SCANNER_GATE_01', '2026-07-09 09:30:15');

-- 25. SEED DATA FOR payment_methods
INSERT INTO payment_methods (id, name, code, provider, status) VALUES
(1, 'Cổng Thanh toán VNPay', 'VNPAY', 'VNPay Sandbox Gateway', 'ACTIVE'),
(2, 'Ví Điện Tử MoMo', 'MOMO', 'MoMo Sandbox Gateway', 'ACTIVE');

-- 26. SEED DATA FOR payments
INSERT INTO payments (id, order_id, payment_method_id, transaction_reference, amount, status, payment_time) VALUES
(1, 1, 1, 'VNPAY_TXREF_771122A', 700000.00, 'SUCCESS', '2026-07-09 08:35:45');

-- 27. SEED DATA FOR membership_tiers
INSERT INTO membership_tiers (id, name, code, discount_percentage, points_multiplier, min_spend) VALUES
(1, 'Silver Member', 'SILVER', 5.00, 1.20, 5000000.00),
(2, 'Gold Member', 'GOLD', 10.00, 1.50, 15000000.00);

-- 28. SEED DATA FOR memberships
INSERT INTO memberships (id, customer_id, tier_id, membership_code, points, join_date, status) VALUES
(1, 1, 1, 'MEM_CUS1_9911', 250, '2025-06-01', 'ACTIVE');

-- 29. SEED DATA FOR promotions
INSERT INTO promotions (id, name, description, start_date, end_date, discount_type, value, status) VALUES
(1, 'Chào mùa Hè 2026', 'Giảm giá trực tiếp khi đặt vé trọn gói từ 2 người trở lên', '2026-06-01', '2026-08-31', 'PERCENTAGE', 10.00, 'ACTIVE');

-- 30. SEED DATA FOR coupons
INSERT INTO coupons (id, promotion_id, code, max_uses, current_uses, discount_amount, status) VALUES
(1, 1, 'HELLO_SUMMER_10', 1000, 45, 25000.00, 'ACTIVE');

-- 31. SEED DATA FOR food_courts
INSERT INTO food_courts (id, park_id, name, code, status) VALUES
(1, 1, 'Khu Ẩm Thực Rừng Xanh', 'FC_GREEN_JUNGLE', 'ACTIVE');

-- 32. SEED DATA FOR food_stalls
INSERT INTO food_stalls (id, food_court_id, name, code, status) VALUES
(1, 1, 'Quầy Đồ Ăn Nhanh Fast & Tasty', 'ST_FAST_FOOD', 'ACTIVE');

-- 33. SEED DATA FOR food_items
INSERT INTO food_items (id, food_stall_id, name, price, status) VALUES
(1, 1, 'Hambuger Bò Phô Mai', 65000.00, 'AVAILABLE'),
(2, 1, 'Khoai Tây Chiên Lắc Phô Mai', 35000.00, 'AVAILABLE');

-- 34. SEED DATA FOR retail_shops
INSERT INTO retail_shops (id, park_id, name, code, status) VALUES
(1, 1, 'Cửa Hàng Lưu Niệm Kỳ Thú', 'SH_SOUVENIR_KIDS', 'ACTIVE');

-- 35. SEED DATA FOR retail_items
INSERT INTO retail_items (id, retail_shop_id, name, sku, price, stock_quantity, status) VALUES
(1, 1, 'Móc Khóa Mascot Phao Rồng Con', 'SKU_MASCOT_KEY_01', 45000.00, 150, 'ACTIVE');

-- 36. SEED DATA FOR parking_lots
INSERT INTO parking_lots (id, park_id, name, total_spaces, occupied_spaces, status) VALUES
(1, 1, 'Bãi xe cổng chính Đầm Sen', 1000, 320, 'ACTIVE');

-- 37. SEED DATA FOR parking_transactions
INSERT INTO parking_transactions (id, parking_lot_id, vehicle_plate, vehicle_type, entry_time, status) VALUES
(1, 1, '59P1-99999', 'CAR', '2026-07-09 09:10:00', 'PARKED');

-- 38. SEED DATA FOR lockers
INSERT INTO lockers (id, zone_id, locker_code, size, status) VALUES
(1, 1, 'LK_Z1_001', 'MEDIUM', 'AVAILABLE');

-- 39. SEED DATA FOR locker_transactions
INSERT INTO locker_transactions (id, locker_id, customer_id, start_time, status) VALUES
(1, 1, 1, '2026-07-09 09:40:00', 'ACTIVE');

-- 40. SEED DATA FOR feedbacks
INSERT INTO feedbacks (id, customer_id, category, content, rating, status) VALUES
(1, 1, 'RIDE', 'Máng trượt Hố Đen Vũ Trụ trượt rất êm và cảm giác rất mạnh, nhân viên hướng dẫn thân thiện.', 5, 'OPEN');

-- 41. SEED DATA FOR notifications
INSERT INTO notifications (id, user_id, title, content, type, status) VALUES
(1, 4, 'Đặt Vé Thành Công', 'Đơn hàng ORD_998811 của bạn đã thanh toán thành công.', 'PUSH', 'SENT');

-- 42. SEED DATA FOR incidents
INSERT INTO incidents (id, zone_id, reporter_id, description, severity, status) VALUES
(1, 1, 3, 'Khách hàng vô tình trượt chân ngã nhẹ ở thành bể tạo sóng, đã sơ cứu tại chỗ.', 'LOW', 'OPEN');

-- 43. SEED DATA FOR audit_logs
INSERT INTO audit_logs (id, user_id, action, target_table, record_id, old_values, new_values, ip_address) VALUES
(1, 1, 'CREATE', 'rides', 1, null, '{"name": "Hố Đen Vũ Trụ", "code": "R_BLACK_HOLE"}', '127.0.0.1');
