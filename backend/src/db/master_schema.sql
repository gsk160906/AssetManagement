-- master_schema.sql
-- Chains and executes the complete AssetFlow database schema initialization in order

-- 1. Extensions & Enums
\i schema/enums.sql

-- 2. Tables
\i schema/tables/departments.sql
\i schema/tables/users.sql
\i schema/tables/asset_categories.sql
\i schema/tables/assets.sql
\i schema/tables/asset_allocations.sql
\i schema/tables/transfer_requests.sql
\i schema/tables/resource_bookings.sql
\i schema/tables/maintenance_requests.sql
\i schema/tables/audit_cycles.sql
\i schema/tables/audit_items.sql
\i schema/tables/notifications.sql
\i schema/tables/activity_logs.sql

-- 3. Load Indexes
\i schema/indexes.sql
