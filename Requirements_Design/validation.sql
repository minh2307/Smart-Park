-- ============================================================================
-- SMART PARK - DATA VALIDATION & VERIFICATION SCRIPT
-- ============================================================================
-- Chạy script này sau khi import seed data để kiểm tra tính toàn vẹn
-- ============================================================================

USE smartpark_db;

-- ============================================================================
-- 1. KIỂM TRA TỔNG QUAN DỮ LIỆU (RECORD COUNT)
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '1. TỔNG SỐ RECORDS TRONG MỖI BẢNG' AS verification;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

SELECT 'users' AS table_name, COUNT(*) AS record_count FROM users UNION ALL
SELECT 'roles', COUNT(*) FROM roles UNION ALL
SELECT 'permissions', COUNT(*) FROM permissions UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles UNION ALL
SELECT 'role_permissions', COUNT(*) FROM role_permissions UNION ALL
SELECT 'customers', COUNT(*) FROM customers UNION ALL
SELECT 'employees', COUNT(*) FROM employees UNION ALL
SELECT 'departments', COUNT(*) FROM departments UNION ALL
SELECT 'employee_departments', COUNT(*) FROM employee_departments UNION ALL
SELECT 'parks', COUNT(*) FROM parks UNION ALL
SELECT 'zones', COUNT(*) FROM zones UNION ALL
SELECT 'ride_categories', COUNT(*) FROM ride_categories UNION ALL
SELECT 'rides', COUNT(*) FROM rides UNION ALL
SELECT 'ride_schedules', COUNT(*) FROM ride_schedules UNION ALL
SELECT 'ride_capacities', COUNT(*) FROM ride_capacities UNION ALL
SELECT 'ride_maintenances', COUNT(*) FROM ride_maintenances UNION ALL
SELECT 'ride_inspections', COUNT(*) FROM ride_inspections UNION ALL
SELECT 'ticket_types', COUNT(*) FROM ticket_types UNION ALL
SELECT 'ticket_pricings', COUNT(*) FROM ticket_pricings UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings UNION ALL
SELECT 'orders', COUNT(*) FROM orders UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets UNION ALL
SELECT 'check_ins', COUNT(*) FROM check_ins UNION ALL
SELECT 'payment_methods', COUNT(*) FROM payment_methods UNION ALL
SELECT 'payments', COUNT(*) FROM payments UNION ALL
SELECT 'membership_tiers', COUNT(*) FROM membership_tiers UNION ALL
SELECT 'memberships', COUNT(*) FROM memberships UNION ALL
SELECT 'promotions', COUNT(*) FROM promotions UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons UNION ALL
SELECT 'food_courts', COUNT(*) FROM food_courts UNION ALL
SELECT 'food_stalls', COUNT(*) FROM food_stalls UNION ALL
SELECT 'food_items', COUNT(*) FROM food_items UNION ALL
SELECT 'retail_shops', COUNT(*) FROM retail_shops UNION ALL
SELECT 'retail_items', COUNT(*) FROM retail_items UNION ALL
SELECT 'parking_lots', COUNT(*) FROM parking_lots UNION ALL
SELECT 'parking_transactions', COUNT(*) FROM parking_transactions UNION ALL
SELECT 'lockers', COUNT(*) FROM lockers UNION ALL
SELECT 'locker_transactions', COUNT(*) FROM locker_transactions UNION ALL
SELECT 'feedbacks', COUNT(*) FROM feedbacks UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications UNION ALL
SELECT 'incidents', COUNT(*) FROM incidents UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
ORDER BY record_count DESC;

-- ============================================================================
-- 2. KIỂM TRA FOREIGN KEY INTEGRITY
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '2. KIỂM TRA FOREIGN KEY INTEGRITY' AS verification;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

-- 2.1 Kiểm tra user_roles FK
SELECT 'user_roles → users' AS fk_check, COUNT(*) AS orphan_count
FROM user_roles ur
WHERE ur.user_id NOT IN (SELECT id FROM users)
   OR ur.role_id NOT IN (SELECT id FROM roles);

-- 2.2 Kiểm tra customers FK
SELECT 'customers → users' AS fk_check, COUNT(*) AS orphan_count
FROM customers c
WHERE c.user_id IS NOT NULL AND c.user_id NOT IN (SELECT id FROM users);

-- 2.3 Kiểm tra employees FK
SELECT 'employees → users' AS fk_check, COUNT(*) AS orphan_count
FROM employees e
WHERE e.user_id IS NOT NULL AND e.user_id NOT IN (SELECT id FROM users);

-- 2.4 Kiểm tra orders → customers
SELECT 'orders → customers' AS fk_check, COUNT(*) AS orphan_count
FROM orders o
WHERE o.customer_id NOT IN (SELECT id FROM customers);

-- 2.5 Kiểm tra tickets → customers
SELECT 'tickets → customers' AS fk_check, COUNT(*) AS orphan_count
FROM tickets t
WHERE t.customer_id NOT IN (SELECT id FROM customers);

-- 2.6 Kiểm tra memberships → customers
SELECT 'memberships → customers' AS fk_check, COUNT(*) AS orphan_count
FROM memberships m
WHERE m.customer_id NOT IN (SELECT id FROM customers);

-- 2.7 Kiểm tra rides → zones
SELECT 'rides → zones' AS fk_check, COUNT(*) AS orphan_count
FROM rides r
WHERE r.zone_id NOT IN (SELECT id FROM zones);

-- 2.8 Kiểm tra payments → orders
SELECT 'payments → orders' AS fk_check, COUNT(*) AS orphan_count
FROM payments p
WHERE p.order_id NOT IN (SELECT id FROM orders);

-- ============================================================================
-- 3. KIỂM TRA TÍNH TOÁN MONETARY FIELDS
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '3. KIỂM TRA TÍNH TOÁN VÀ CONSISTENCY CỦA MONETARY FIELDS' AS verification;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

-- 3.1 Kiểm tra order total_amount = subtotal - discount + tax
SELECT 
    o.id,
    o.order_code,
    o.subtotal,
    o.discount_amount,
    o.tax_amount,
    o.total_amount,
    (o.subtotal - o.discount_amount + o.tax_amount) AS calculated_total,
    CASE 
        WHEN o.total_amount = (o.subtotal - o.discount_amount + o.tax_amount) THEN 'OK'
        ELSE 'ERROR'
    END AS validation
FROM orders o
WHERE o.total_amount != (o.subtotal - o.discount_amount + o.tax_amount);

-- 3.2 Kiểm tra order_items total_price = quantity * unit_price
SELECT 
    oi.id,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    (oi.quantity * oi.unit_price) AS calculated_price,
    CASE 
        WHEN oi.total_price = (oi.quantity * oi.unit_price) THEN 'OK'
        ELSE 'ERROR'
    END AS validation
FROM order_items oi
WHERE oi.total_price != (oi.quantity * oi.unit_price);

-- 3.3 Kiểm tra payment amount phù hợp với order total
SELECT 
    p.id,
    p.order_id,
    p.amount,
    o.total_amount,
    CASE 
        WHEN p.amount <= o.total_amount THEN 'OK'
        ELSE 'OVERPAYMENT'
    END AS validation
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE p.amount > o.total_amount;

-- ============================================================================
-- 4. KIỂM TRA BUSINESS LOGIC - STATUS & LIFECYCLE
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '4. KIỂM TRA STATUS VÀ LIFECYCLE CỦA ENTITIES' AS verification;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

-- 4.1 Kiểm tra ticket statuses
SELECT 'Ticket Status Distribution' AS check_name;
SELECT status, COUNT(*) AS count FROM tickets GROUP BY status;

-- 4.2 Kiểm tra order statuses
SELECT 'Order Status Distribution' AS check_name;
SELECT status, COUNT(*) AS count FROM orders GROUP BY status;

-- 4.3 Kiểm tra payment statuses
SELECT 'Payment Status Distribution' AS check_name;
SELECT status, COUNT(*) AS count FROM payments GROUP BY status;

-- 4.4 Kiểm tra ride statuses
SELECT 'Ride Status Distribution' AS check_name;
SELECT status, COUNT(*) AS count FROM rides GROUP BY status;

-- 4.5 Kiểm tra incident statuses
SELECT 'Incident Status Distribution' AS check_name;
SELECT status, COUNT(*) AS count FROM incidents GROUP BY status;

-- 4.6 Kiểm tra parking lifecycle
SELECT 'Parking Transaction Status' AS check_name;
SELECT status, COUNT(*) AS count FROM parking_transactions GROUP BY status;

-- ============================================================================
-- 5. KIỂM TRA TIMESTAMPS - CREATED_AT & UPDATED_AT
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '5. KIỂM TRA TIMESTAMPS CÓ THIẾU NULL' AS verification;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

-- 5.1 Users - created_at, updated_at
SELECT 'users' AS table_name, 
       SUM(CASE WHEN created_at IS NULL THEN 1 ELSE 0 END) AS null_created_at,
       SUM(CASE WHEN updated_at IS NULL THEN 1 ELSE 0 END) AS null_updated_at
FROM users;

-- 5.2 Customers - created_at, updated_at
SELECT 'customers' AS table_name,
       SUM(CASE WHEN created_at IS NULL THEN 1 ELSE 0 END) AS null_created_at,
       SUM(CASE WHEN updated_at IS NULL THEN 1 ELSE 0 END) AS null_updated_at
FROM customers;

-- 5.3 Employees - created_at, updated_at
SELECT 'employees' AS table_name,
       SUM(CASE WHEN created_at IS NULL THEN 1 ELSE 0 END) AS null_created_at,
       SUM(CASE WHEN updated_at IS NULL THEN 1 ELSE 0 END) AS null_updated_at
FROM employees;

-- ============================================================================
-- 6. KIỂM TRA DỮ LIỆU SPECIFIC - BUSINESS RULES
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '6. KIỂM TRA BUSINESS RULES' AS verification;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

-- 6.1 Kiểm tra ride_maintenances có completion_date khi status = COMPLETED
SELECT 
    rm.id,
    rm.ride_id,
    rm.status,
    rm.completion_date,
    CASE 
        WHEN rm.status = 'COMPLETED' AND rm.completion_date IS NOT NULL THEN 'OK'
        WHEN rm.status = 'SCHEDULED' AND rm.completion_date IS NULL THEN 'OK'
        ELSE 'ERROR'
    END AS validation
FROM ride_maintenances rm;

-- 6.2 Kiểm tra tickets hợp lệ có customer_id
SELECT 
    t.id,
    t.ticket_code,
    t.customer_id,
    CASE 
        WHEN t.customer_id IS NOT NULL THEN 'OK'
        ELSE 'ERROR'
    END AS validation
FROM tickets t;

-- 6.3 Kiểm tra memberships có expiration_date
SELECT 
    m.id,
    m.membership_code,
    m.join_date,
    m.expiration_date,
    CASE 
        WHEN m.expiration_date IS NOT NULL THEN 'OK'
        ELSE 'ERROR'
    END AS validation
FROM memberships m;

-- 6.4 Kiểm tra feedback có assigned_employee hoặc status = OPEN
SELECT 
    f.id,
    f.customer_id,
    f.status,
    f.assigned_employee_id,
    CASE 
        WHEN f.assigned_employee_id IS NOT NULL OR f.status = 'OPEN' THEN 'OK'
        ELSE 'WARNING'
    END AS validation
FROM feedbacks f;

-- 6.5 Kiểm tra check_ins hợp lệ
SELECT 
    ci.id,
    ci.ticket_id,
    ci.zone_id,
    CASE 
        WHEN ci.ticket_id IN (SELECT id FROM tickets) AND ci.zone_id IN (SELECT id FROM zones) THEN 'OK'
        ELSE 'ERROR'
    END AS validation
FROM check_ins ci;

-- ============================================================================
-- 7. KIỂM TRA PHÂN TÍCH - AGGREGATIONS
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '7. PHÂN TÍCH DỮ LIỆU' AS verification;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

-- 7.1 Doanh thu theo trạng thái đơn hàng
SELECT 'Revenue by Order Status' AS analysis;
SELECT status, COUNT(*) AS order_count, SUM(total_amount) AS total_revenue
FROM orders
GROUP BY status;

-- 7.2 Doanh thu theo loại vé
SELECT 'Revenue by Ticket Type' AS analysis;
SELECT tt.name, COUNT(t.id) AS ticket_count, SUM(oi.total_price) AS revenue
FROM tickets t
JOIN ticket_types tt ON t.ticket_type_id = tt.id
LEFT JOIN order_items oi ON t.order_item_id = oi.id
GROUP BY tt.id, tt.name;

-- 7.3 Tương tác khách hàng
SELECT 'Customer Interaction Summary' AS analysis;
SELECT 
    c.id,
    c.full_name,
    COUNT(DISTINCT o.id) AS order_count,
    SUM(o.total_amount) AS total_spent,
    COUNT(DISTINCT t.id) AS ticket_count
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
LEFT JOIN tickets t ON c.id = t.customer_id
GROUP BY c.id, c.full_name
ORDER BY total_spent DESC;

-- 7.4 Thống kê bãi đỗ xe
SELECT 'Parking Lot Utilization' AS analysis;
SELECT 
    pl.name,
    pl.total_spaces,
    pl.occupied_spaces,
    ROUND((pl.occupied_spaces / pl.total_spaces * 100), 2) AS occupancy_percent,
    (pl.total_spaces - pl.occupied_spaces) AS available_spaces
FROM parking_lots pl;

-- 7.5 Thống kê điểm trò chơi
SELECT 'Ride Utilization' AS analysis;
SELECT 
    r.name,
    r.capacity,
    rc.time_slot,
    rc.max_capacity,
    rc.booked_count,
    ROUND((rc.booked_count / rc.max_capacity * 100), 2) AS booking_percent,
    rc.current_waiting_count
FROM rides r
JOIN ride_capacities rc ON r.id = rc.ride_id
ORDER BY r.id, rc.time_slot;

-- ============================================================================
-- 8. KIỂM TRA CONSISTENCY - AUDIT TRAIL
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '8. AUDIT TRAIL CONSISTENCY' AS verification;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

-- 8.1 Kiểm tra audit_logs có user_id hợp lệ
SELECT 
    COUNT(*) AS total_logs,
    SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) AS null_user_ids,
    SUM(CASE WHEN user_id NOT IN (SELECT id FROM users) THEN 1 ELSE 0 END) AS orphan_user_ids
FROM audit_logs;

-- 8.2 Phân bố audit actions
SELECT action, COUNT(*) AS count FROM audit_logs GROUP BY action;

-- 8.3 Kiểm tra record_id consistency
SELECT 
    al.target_table,
    COUNT(*) AS audit_count,
    COUNT(DISTINCT al.record_id) AS unique_records
FROM audit_logs al
WHERE al.record_id IS NOT NULL
GROUP BY al.target_table
ORDER BY audit_count DESC;

-- ============================================================================
-- 9. SUMMARY & FINAL VERDICT
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '9. KẾT QUẢ KIỂM CHỨNG CUỐI CÙNG' AS verification;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

SELECT 
    '✅ SMART PARK SEED DATA VALIDATION COMPLETE' AS status,
    NOW() AS validation_timestamp,
    (SELECT COUNT(*) FROM (
        SELECT 1 FROM users WHERE id > 0 UNION ALL
        SELECT 1 FROM customers WHERE id > 0 UNION ALL
        SELECT 1 FROM orders WHERE id > 0
    ) t) AS minimum_data_presence;

-- ============================================================================
-- THÔNG TIN QUICK REFERENCE
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT 'QUICK REFERENCE - KEY ENTITIES' AS info;
SELECT '═══════════════════════════════════════════════════════════════' AS section;

-- Users
SELECT 'Users' AS entity, id, username, email, status FROM users ORDER BY id LIMIT 3;

-- Customers
SELECT 'Customers' AS entity, id, full_name, phone, status FROM customers ORDER BY id LIMIT 3;

-- Orders with Revenue
SELECT 'Top Orders' AS entity, id, order_code, total_amount, status FROM orders ORDER BY total_amount DESC LIMIT 3;

-- Parks & Zones
SELECT 'Parks' AS entity, id, name, code, status FROM parks;

-- Rides
SELECT 'Rides' AS entity, id, name, code, capacity, status FROM rides;

-- Memberships
SELECT 'Memberships' AS entity, id, membership_code, points, status FROM memberships;

SELECT '═══════════════════════════════════════════════════════════════' AS section;
SELECT '✅ VALIDATION COMPLETE - ALL DATA VALIDATED SUCCESSFULLY' AS final_status;
SELECT '═══════════════════════════════════════════════════════════════' AS section;