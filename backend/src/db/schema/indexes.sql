-- Create indexes to optimize database queries

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_employee_code ON users(employee_code);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Departments
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_id);

-- Asset Categories
CREATE INDEX IF NOT EXISTS idx_asset_categories_name ON asset_categories(name);

-- Assets
CREATE INDEX IF NOT EXISTS idx_assets_tag ON assets(asset_tag);
CREATE INDEX IF NOT EXISTS idx_assets_serial ON assets(serial_number);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_department ON assets(current_department_id);

-- Asset Allocations
CREATE INDEX IF NOT EXISTS idx_allocations_asset ON asset_allocations(asset_id);
CREATE INDEX IF NOT EXISTS idx_allocations_employee ON asset_allocations(employee_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON asset_allocations(status);

-- Resource Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_resource ON resource_bookings(resource_id);
CREATE INDEX IF NOT EXISTS idx_bookings_employee ON resource_bookings(employee_id);
CREATE INDEX IF NOT EXISTS idx_bookings_times ON resource_bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON resource_bookings(status);

-- Maintenance Requests
CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON maintenance_requests(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_technician ON maintenance_requests(assigned_technician_id);

-- Audit Cycles
CREATE INDEX IF NOT EXISTS idx_audit_cycles_department ON audit_cycles(department_id);
CREATE INDEX IF NOT EXISTS idx_audit_cycles_status ON audit_cycles(status);

-- Audit Items
CREATE INDEX IF NOT EXISTS idx_audit_items_cycle ON audit_items(audit_cycle_id);
CREATE INDEX IF NOT EXISTS idx_audit_items_asset ON audit_items(asset_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Activity Logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity, entity_id);
