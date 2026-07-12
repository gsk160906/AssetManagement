-- Clear down existing mock data (in reverse dependency order)
DELETE FROM activity_logs;
DELETE FROM notifications;
DELETE FROM audit_items;
DELETE FROM audit_cycles;
DELETE FROM maintenance_requests;
DELETE FROM resource_bookings;
DELETE FROM transfer_requests;
DELETE FROM asset_allocations;
DELETE FROM assets;
DELETE FROM asset_categories;
DELETE FROM users;
DELETE FROM departments;

-- 1. Seed Departments (3 Departments)
INSERT INTO departments (id, name, parent_id, manager_id, status) VALUES
('d1000000-0000-0000-0000-000000000001', 'Information Technology', NULL, NULL, 'ACTIVE'),
('d1000000-0000-0000-0000-000000000002', 'Human Resources', NULL, NULL, 'ACTIVE'),
('d1000000-0000-0000-0000-000000000003', 'Finance & Accounting', NULL, NULL, 'ACTIVE');

-- 2. Seed Users (1 Admin + 10 Employees)
-- Admin
INSERT INTO users (id, employee_code, name, email, password_hash, department_id, role, status) VALUES
('e1000000-0000-0000-0000-000000000000', 'EMP-000', 'AssetFlow Admin', 'admin@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', 'd1000000-0000-0000-0000-000000000001', 'ADMIN', 'ACTIVE');

-- Link IT manager_id to Admin
UPDATE departments SET manager_id = 'e1000000-0000-0000-0000-000000000000' WHERE id = 'd1000000-0000-0000-0000-000000000001';

-- IT Employees
INSERT INTO users (id, employee_code, name, email, password_hash, department_id, role, status) VALUES
('e1000000-0000-0000-0000-000000000001', 'EMP-001', 'David Smith', 'david.smith@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', 'd1000000-0000-0000-0000-000000000001', 'ASSET_MANAGER', 'ACTIVE'),
('e1000000-0000-0000-0000-000000000002', 'EMP-002', 'Sarah Jenkins', 'sarah.jenkins@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', 'd1000000-0000-0000-0000-000000000001', 'EMPLOYEE', 'ACTIVE');

-- HR Employees
INSERT INTO users (id, employee_code, name, email, password_hash, department_id, role, status) VALUES
('e1000000-0000-0000-0000-000000000003', 'EMP-003', 'Emma Watson', 'emma.watson@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', 'd1000000-0000-0000-0000-000000000002', 'DEPARTMENT_HEAD', 'ACTIVE'),
('e1000000-0000-0000-0000-000000000004', 'EMP-004', 'Michael Chang', 'michael.chang@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', 'd1000000-0000-0000-0000-000000000002', 'EMPLOYEE', 'ACTIVE'),
('e1000000-0000-0000-0000-000000000005', 'EMP-005', 'Olivia Davis', 'olivia.davis@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', 'd1000000-0000-0000-0000-000000000002', 'EMPLOYEE', 'ACTIVE');

UPDATE departments SET manager_id = 'e1000000-0000-0000-0000-000000000003' WHERE id = 'd1000000-0000-0000-0000-000000000002';

-- Finance Employees
INSERT INTO users (id, employee_code, name, email, password_hash, department_id, role, status) VALUES
('e1000000-0000-0000-0000-000000000006', 'EMP-006', 'James Wilson', 'james.wilson@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', 'd1000000-0000-0000-0000-000000000003', 'DEPARTMENT_HEAD', 'ACTIVE'),
('e1000000-0000-0000-0000-000000000007', 'EMP-007', 'Robert Miller', 'robert.miller@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', 'd1000000-0000-0000-0000-000000000003', 'EMPLOYEE', 'ACTIVE'),
('e1000000-0000-0000-0000-000000000008', 'EMP-008', 'Sophia Taylor', 'sophia.taylor@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', 'd1000000-0000-0000-0000-000000000003', 'EMPLOYEE', 'ACTIVE');

UPDATE departments SET manager_id = 'e1000000-0000-0000-0000-000000000006' WHERE id = 'd1000000-0000-0000-0000-000000000003';

-- Loose Employees (No Manager / No Department assigned)
INSERT INTO users (id, employee_code, name, email, password_hash, department_id, role, status) VALUES
('e1000000-0000-0000-0000-000000000009', 'EMP-009', 'William Brown', 'william.brown@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', NULL, 'EMPLOYEE', 'ACTIVE'),
('e1000000-0000-0000-0000-000000000010', 'EMP-010', 'Linda Martinez', 'linda.martinez@assetflow.com', '$2b$10$wU05Zpve/s4Clyu4j.q8Vuh8BWhZ5eHnpePzB.x028y0yO6e2jY9C', NULL, 'EMPLOYEE', 'ACTIVE');


-- 3. Seed Asset Categories (5 Categories)
INSERT INTO asset_categories (id, name, description, default_warranty_months, status) VALUES
('c1000000-0000-0000-0000-000000000001', 'Computing Hardware', 'Laptops, desktops, and workstation tablets', 24, 'ACTIVE'),
('c1000000-0000-0000-0000-000000000002', 'Mobile Devices', 'Mobile phones and communications hardware', 12, 'ACTIVE'),
('c1000000-0000-0000-0000-000000000003', 'AV Equipment', 'Monitors, projectors, and audio soundbars', 36, 'ACTIVE'),
('c1000000-0000-0000-0000-000000000004', 'Office Furniture', 'Desks, ergonomic chairs, and acoustic pods', 60, 'ACTIVE'),
('c1000000-0000-0000-0000-000000000005', 'Company Vehicles', 'Delivery vans and corporate shared cars', 24, 'ACTIVE');


-- 4. Seed Assets (20 Assets)
INSERT INTO assets (id, asset_tag, name, category_id, serial_number, manufacturer, model, acquisition_date, acquisition_cost, warranty_expiry_date, condition, status, current_department_id, current_location, is_shared_bookable, created_by_id) VALUES
-- Computing
('a1000000-0000-0000-0000-000000000001', 'AST-IT-001', 'Dell XPS 15 Laptop', 'c1000000-0000-0000-0000-000000000001', 'SN-DELL-XPS15-001', 'Dell', 'XPS 15 9530', '2025-01-15', 1850.00, '2027-01-15', 'EXCELLENT', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000001', 'IT HQ Server Room', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000002', 'AST-IT-002', 'Dell XPS 15 Laptop', 'c1000000-0000-0000-0000-000000000001', 'SN-DELL-XPS15-002', 'Dell', 'XPS 15 9530', '2025-01-15', 1850.00, '2027-01-15', 'GOOD', 'ALLOCATED', 'd1000000-0000-0000-0000-000000000001', 'Remote', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000003', 'AST-IT-003', 'MacBook Pro 16"', 'c1000000-0000-0000-0000-000000000001', 'SN-APL-MBP16-001', 'Apple', 'M3 Pro 16"', '2025-02-10', 2499.00, '2027-02-10', 'EXCELLENT', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000001', 'IT HQ Storage Room', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000004', 'AST-HR-001', 'Lenovo ThinkPad T14', 'c1000000-0000-0000-0000-000000000001', 'SN-LNV-T14-001', 'Lenovo', 'ThinkPad T14 Gen 4', '2024-05-12', 1250.00, '2026-05-12', 'GOOD', 'ALLOCATED', 'd1000000-0000-0000-0000-000000000002', 'HR Cubicle 4', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000005', 'AST-FIN-001', 'Lenovo ThinkPad T14', 'c1000000-0000-0000-0000-000000000001', 'SN-LNV-T14-002', 'Lenovo', 'ThinkPad T14 Gen 4', '2024-05-12', 1250.00, '2026-05-12', 'GOOD', 'ALLOCATED', 'd1000000-0000-0000-0000-000000000003', 'Finance Room Desk 1', FALSE, 'e1000000-0000-0000-0000-000000000000'),

-- Mobile
('a1000000-0000-0000-0000-000000000006', 'AST-MOB-001', 'iPhone 15 Pro 256GB', 'c1000000-0000-0000-0000-000000000002', 'SN-APL-IP15P-001', 'Apple', 'iPhone 15 Pro', '2025-03-01', 999.00, '2026-03-01', 'EXCELLENT', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000001', 'IT HQ Storage Room', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000007', 'AST-MOB-002', 'iPhone 15 Pro 256GB', 'c1000000-0000-0000-0000-000000000002', 'SN-APL-IP15P-002', 'Apple', 'iPhone 15 Pro', '2025-03-01', 999.00, '2026-03-01', 'GOOD', 'ALLOCATED', 'd1000000-0000-0000-0000-000000000002', 'Remote', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000008', 'AST-MOB-003', 'Samsung Galaxy S24', 'c1000000-0000-0000-0000-000000000002', 'SN-SAM-S24-001', 'Samsung', 'Galaxy S24 Ultra', '2025-03-10', 1199.00, '2026-03-10', 'EXCELLENT', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000001', 'IT HQ Storage Room', FALSE, 'e1000000-0000-0000-0000-000000000000'),

-- AV Equipment
('a1000000-0000-0000-0000-000000000009', 'AST-AV-001', 'Dell UltraSharp 32" 4K', 'c1000000-0000-0000-0000-000000000003', 'SN-DELL-U32-001', 'Dell', 'U3223QE', '2024-08-20', 749.00, '2027-08-20', 'EXCELLENT', 'ALLOCATED', 'd1000000-0000-0000-0000-000000000001', 'IT Desk 3', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000010', 'AST-AV-002', 'Dell UltraSharp 32" 4K', 'c1000000-0000-0000-0000-000000000003', 'SN-DELL-U32-002', 'Dell', 'U3223QE', '2024-08-20', 749.00, '2027-08-20', 'GOOD', 'ALLOCATED', 'd1000000-0000-0000-0000-000000000003', 'Finance Room Desk 1', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000011', 'AST-AV-003', 'Epson Pro Projector', 'c1000000-0000-0000-0000-000000000003', 'SN-EPS-PR-001', 'Epson', 'EB-L530U', '2024-09-05', 1450.00, '2026-09-05', 'EXCELLENT', 'RESERVED', 'd1000000-0000-0000-0000-000000000001', 'Conference Room A', TRUE, 'e1000000-0000-0000-0000-000000000000'),

-- Furniture
('a1000000-0000-0000-0000-000000000012', 'AST-FUR-001', 'Herman Miller Aeron Chair', 'c1000000-0000-0000-0000-000000000004', 'SN-HM-AER-001', 'Herman Miller', 'Aeron Size B', '2023-11-15', 1250.00, '2035-11-15', 'GOOD', 'ALLOCATED', 'd1000000-0000-0000-0000-000000000001', 'IT HQ Server Desk', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000013', 'AST-FUR-002', 'Herman Miller Aeron Chair', 'c1000000-0000-0000-0000-000000000004', 'SN-HM-AER-002', 'Herman Miller', 'Aeron Size B', '2023-11-15', 1250.00, '2035-11-15', 'GOOD', 'ALLOCATED', 'd1000000-0000-0000-0000-000000000002', 'HR Manager Office', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000014', 'AST-FUR-003', 'Acoustic Sound Pod', 'c1000000-0000-0000-0000-000000000004', 'SN-POD-AC-001', 'Framery', 'Framery One', '2024-04-10', 7999.00, '2026-04-10', 'EXCELLENT', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000002', 'HR Shared Space', TRUE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000015', 'AST-FUR-004', 'L-Shaped Desk White', 'c1000000-0000-0000-0000-000000000004', 'SN-DESK-L-001', 'Steelcase', 'Migration SE', '2024-04-12', 650.00, '2029-04-12', 'GOOD', 'ALLOCATED', 'd1000000-0000-0000-0000-000000000003', 'Finance Desk 4', FALSE, 'e1000000-0000-0000-0000-000000000000'),

-- Vehicles
('a1000000-0000-0000-0000-000000000016', 'AST-VEH-001', 'Tesla Model 3 Shared', 'c1000000-0000-0000-0000-000000000005', 'SN-TSL-M3-001', 'Tesla', 'Model 3 2024', '2024-01-10', 38990.00, '2028-01-10', 'GOOD', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000001', 'Garage Slot 1', TRUE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000017', 'AST-VEH-002', 'Tesla Model 3 Shared', 'c1000000-0000-0000-0000-000000000005', 'SN-TSL-M3-002', 'Tesla', 'Model 3 2024', '2024-01-10', 38990.00, '2028-01-10', 'GOOD', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000001', 'Garage Slot 2', TRUE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000018', 'AST-VEH-003', 'Ford Transit Delivery Van', 'c1000000-0000-0000-0000-000000000005', 'SN-FRD-TR-001', 'Ford', 'Transit 250', '2023-06-15', 32500.00, '2025-06-15', 'POOR', 'UNDER_MAINTENANCE', 'd1000000-0000-0000-0000-000000000001', 'City Auto Repairs', FALSE, 'e1000000-0000-0000-0000-000000000000'),

-- Retired/Disposed
('a1000000-0000-0000-0000-000000000019', 'AST-IT-004', 'Dell Latitude 2020', 'c1000000-0000-0000-0000-000000000001', 'SN-DELL-LAT20-001', 'Dell', 'Latitude 5410', '2020-02-15', 950.00, '2022-02-15', 'POOR', 'RETIRED', NULL, 'E-Waste Depot', FALSE, 'e1000000-0000-0000-0000-000000000000'),
('a1000000-0000-0000-0000-000000000020', 'AST-MOB-004', 'Samsung S10 Broken', 'c1000000-0000-0000-0000-000000000002', 'SN-SAM-S10-001', 'Samsung', 'Galaxy S10', '2019-09-01', 899.00, '2020-09-01', 'DAMAGED', 'DISPOSED', NULL, 'Recycled', FALSE, 'e1000000-0000-0000-0000-000000000000');


-- 5. Seed Asset Allocations (IT XPS, Lenovo HR, Lenovo Finance, iPhone HR, etc.)
INSERT INTO asset_allocations (asset_id, employee_id, allocated_date, expected_return_date, actual_return_date, condition_before, condition_after, status, notes) VALUES
('a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', '2025-01-16', '2027-01-16', NULL, 'GOOD', NULL, 'ACTIVE', 'Standard workstation allocation for developer workflow'),
('a1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000004', '2024-05-15', '2026-05-15', NULL, 'GOOD', NULL, 'ACTIVE', 'HR Coordinator laptop'),
('a1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000007', '2024-05-15', '2026-05-15', NULL, 'GOOD', NULL, 'ACTIVE', 'Finance Accountant desktop replacement'),
('a1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000005', '2025-03-02', '2026-03-02', NULL, 'EXCELLENT', NULL, 'ACTIVE', 'Company cellular allocation for HR support'),
-- Returned allocation
('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '2025-01-16', '2025-03-16', '2025-03-15', 'EXCELLENT', 'EXCELLENT', 'RETURNED', 'Returned early prior to transition');


-- 6. Seed Resource Bookings
INSERT INTO resource_bookings (resource_id, employee_id, start_time, end_time, purpose, notes, status) VALUES
('a1000000-0000-0000-0000-000000000011', 'e1000000-0000-0000-0000-000000000003', '2026-07-15 10:00:00', '2026-07-15 12:00:00', 'HR Board Meeting', 'Need projector configured for dual presentation', 'UPCOMING'),
('a1000000-0000-0000-0000-000000000016', 'e1000000-0000-0000-0000-000000000006', '2026-07-16 09:00:00', '2026-07-16 17:00:00', 'Client Visit - Audit Review', 'Travel to local regional subsidiary', 'UPCOMING'),
('a1000000-0000-0000-0000-000000000017', 'e1000000-0000-0000-0000-000000000001', '2026-07-12 08:00:00', '2026-07-12 18:00:00', 'Site Assessment', 'Shared vehicle booking', 'ONGOING');


-- 7. Seed Maintenance Requests
INSERT INTO maintenance_requests (asset_id, raised_by_id, description, priority, status, assigned_technician_id, estimated_cost, actual_cost, completed_date) VALUES
('a1000000-0000-0000-0000-000000000018', 'e1000000-0000-0000-0000-000000000001', 'Transmission fluid leak and check engine light active', 'HIGH', 'IN_PROGRESS', 'e1000000-0000-0000-0000-000000000002', 450.00, 0.00, NULL),
('a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'Screen flicker when running high graphics workloads', 'MEDIUM', 'PENDING', NULL, 150.00, 0.00, NULL),
('a1000000-0000-0000-0000-000000000014', 'e1000000-0000-0000-0000-000000000003', 'Door glass latch loose in acoustic pod', 'LOW', 'RESOLVED', 'e1000000-0000-0000-0000-000000000001', 50.00, 45.00, '2026-06-20 14:00:00');


-- 8. Seed Notifications (10 Notifications)
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
('e1000000-0000-0000-0000-000000000002', 'ALLOCATION', 'Asset Assigned', 'Dell XPS 15 Laptop (AST-IT-002) has been assigned to you.', FALSE),
('e1000000-0000-0000-0000-000000000004', 'ALLOCATION', 'Asset Assigned', 'Lenovo ThinkPad T14 (AST-HR-001) has been assigned to you.', TRUE),
('e1000000-0000-0000-0000-000000000003', 'BOOKING', 'Booking Confirmed', 'Your reservation for Epson Projector (AST-AV-003) on 2026-07-15 has been confirmed.', FALSE),
('e1000000-0000-0000-0000-000000000006', 'BOOKING', 'Booking Confirmed', 'Your reservation for Tesla Model 3 (AST-VEH-001) on 2026-07-16 has been confirmed.', FALSE),
('e1000000-0000-0000-0000-000000000001', 'MAINTENANCE', 'Service Scheduled', 'Ford Transit (AST-VEH-003) repair ticket updated to In Progress.', FALSE),
('e1000000-0000-0000-0000-000000000001', 'SYSTEM', 'Welcome to AssetFlow', 'System configuration completed successfully.', TRUE),
('e1000000-0000-0000-0000-000000000003', 'TRANSFER', 'Transfer Pending', 'You have a pending asset transfer request for AST-IT-001.', FALSE),
('e1000000-0000-0000-0000-000000000004', 'REMINDER', 'Expected Return Approaching', 'Laptop expected return date is in 7 days.', FALSE),
('e1000000-0000-0000-0000-000000000006', 'AUDIT', 'Audit cycle scheduled', 'An inventory reconciliation cycle is planned for IT resources next week.', FALSE),
('e1000000-0000-0000-0000-000000000000', 'SYSTEM', 'New User Registered', 'Linda Martinez registered under employee code EMP-010.', FALSE);


-- 9. Seed Activity Logs (10 Logs)
INSERT INTO activity_logs (user_id, action, module, entity, entity_id, metadata) VALUES
('e1000000-0000-0000-0000-000000000000', 'CREATE', 'DEPARTMENTS', 'departments', 'd1000000-0000-0000-0000-000000000001', '{"name": "Information Technology"}'),
('e1000000-0000-0000-0000-000000000000', 'CREATE', 'USERS', 'users', 'e1000000-0000-0000-0000-000000000000', '{"role": "ADMIN", "email": "admin@assetflow.com"}'),
('e1000000-0000-0000-0000-000000000000', 'CREATE', 'CATEGORIES', 'asset_categories', 'c1000000-0000-0000-0000-000000000001', '{"name": "Computing Hardware"}'),
('e1000000-0000-0000-0000-000000000000', 'CREATE', 'ASSETS', 'assets', 'a1000000-0000-0000-0000-000000000001', '{"tag": "AST-IT-001", "model": "XPS 15"}'),
('e1000000-0000-0000-0000-000000000000', 'CREATE', 'ASSETS', 'assets', 'a1000000-0000-0000-0000-000000000002', '{"tag": "AST-IT-002", "model": "XPS 15"}'),
('e1000000-0000-0000-0000-000000000001', 'ALLOCATE', 'ALLOCATIONS', 'asset_allocations', '1', '{"asset_id": "a1000000-0000-0000-0000-000000000002", "user_id": "e1000000-0000-0000-0000-000000000002"}'),
('e1000000-0000-0000-0000-000000000003', 'BOOK', 'BOOKINGS', 'resource_bookings', '1', '{"resource_id": "a1000000-0000-0000-0000-000000000011", "purpose": "HR Board Meeting"}'),
('e1000000-0000-0000-0000-000000000001', 'MAINTENANCE_TICKET', 'MAINTENANCE', 'maintenance_requests', '1', '{"asset_id": "a1000000-0000-0000-0000-000000000018", "priority": "HIGH"}'),
('e1000000-0000-0000-0000-000000000001', 'RESOLVE_TICKET', 'MAINTENANCE', 'maintenance_requests', '3', '{"asset_id": "a1000000-0000-0000-0000-000000000014", "cost": 45.00}'),
('e1000000-0000-0000-0000-000000000002', 'UPDATE', 'USERS', 'users', 'e1000000-0000-0000-0000-000000000002', '{"fields_changed": ["phone_number"]}');
