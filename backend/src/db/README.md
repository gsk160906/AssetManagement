# AssetFlow Database Schema Documentation

This document describes the schema design, tables, relationships, constraints, indexes, and ENUM types for the **AssetFlow** database.

The schema uses UUID primary keys and incorporates audit timestamps, soft deletions, and database-level integrity constraints.

---

## 1. PostgreSQL ENUM Types

We define the following custom ENUMs:

| Name | Values | Purpose |
| :--- | :--- | :--- |
| `USER_ROLE` | `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE` | System user permissions control |
| `USER_STATUS` | `ACTIVE`, `INACTIVE` | User state tracking |
| `DEPARTMENT_STATUS` | `ACTIVE`, `INACTIVE` | Department state tracking |
| `ASSET_STATUS` | `AVAILABLE`, `ALLOCATED`, `RESERVED`, `UNDER_MAINTENANCE`, `LOST`, `RETIRED`, `DISPOSED` | Lifecycle states of physical assets |
| `ASSET_CONDITION` | `EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `DAMAGED` | Physical conditions of assets |
| `ALLOCATION_STATUS` | `ACTIVE`, `RETURNED`, `OVERDUE`, `TRANSFERRED` | Assignment custody logs status |
| `TRANSFER_STATUS` | `PENDING`, `APPROVED`, `REJECTED` | Department custody request workflow |
| `BOOKING_STATUS` | `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED` | Shared bookable resources reservation status |
| `MAINTENANCE_PRIORITY` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Repair priority |
| `MAINTENANCE_STATUS` | `PENDING`, `APPROVED`, `REJECTED`, `TECHNICIAN_ASSIGNED`, `IN_PROGRESS`, `RESOLVED` | Service ticket flow |
| `AUDIT_STATUS` | `PLANNED`, `ACTIVE`, `COMPLETED`, `CLOSED` | Compliance audit state |
| `VERIFICATION_STATUS` | `VERIFIED`, `MISSING`, `DAMAGED` | Reconciliation result per audited asset |
| `NOTIFICATION_TYPE` | `ALLOCATION`, `BOOKING`, `MAINTENANCE`, `AUDIT`, `TRANSFER`, `REMINDER`, `SYSTEM` | Alert taxonomy classification |

---

## 2. Table Schemas & Relationships

### Departments (`departments`)
Stores organizational operational departments. Parent-child relationships are supported.
- `id` `UUID`: Primary key, defaults to `gen_random_uuid()`.
- `name` `VARCHAR(100)`: Unique name.
- `parent_id` `UUID`: Self-referencing foreign key `departments.id` for hierarchies.
- `manager_id` `UUID`: Foreign key to `users.id` representing the head.
- `status` `DEPARTMENT_STATUS`: Default `ACTIVE`.

### Users (`users`)
Stores user accounts, credentials, and employee profiles.
- `id` `UUID`: Primary key.
- `employee_code` `VARCHAR(50)`: Unique, e.g., `EMP-001`.
- `name` `VARCHAR(150)`: Full name.
- `email` `VARCHAR(150)`: Unique.
- `password_hash` `VARCHAR(255)`.
- `department_id` `UUID`: Foreign key to `departments.id`.
- `role` `USER_ROLE`: Default `EMPLOYEE`.
- `status` `USER_STATUS`: Default `ACTIVE`.
- `phone_number` `VARCHAR(20)`.
- `profile_image` `VARCHAR(255)`.

### Asset Categories (`asset_categories`)
Defines asset taxonomy.
- `id` `UUID`: Primary key.
- `name` `VARCHAR(100)`: Unique name.
- `default_warranty_months` `INT`: Default `12`, with check constraint `>= 0`.

### Assets (`assets`)
Tracks physical inventory items, shared bookable resources, costs, and statuses.
- `id` `UUID`: Primary key.
- `asset_tag` `VARCHAR(100)`: Unique barcode or tag ID.
- `name` `VARCHAR(150)`: Asset description.
- `category_id` `UUID`: Foreign key to `asset_categories.id`.
- `serial_number` `VARCHAR(100)`: Unique.
- `manufacturer` / `model` `VARCHAR(100)`.
- `acquisition_date` `DATE` / `acquisition_cost` `DECIMAL` (check `>= 0`).
- `warranty_expiry_date` `DATE` (check `>= acquisition_date`).
- `condition` `ASSET_CONDITION`: Default `EXCELLENT`.
- `status` `ASSET_STATUS`: Default `AVAILABLE`.
- `current_department_id` `UUID`: Foreign key to `departments.id`.
- `current_location` `VARCHAR(255)`: Location descriptor.
- `is_shared_bookable` `BOOLEAN`: Default `FALSE`.
- `created_by_id` `UUID`: Foreign key to `users.id`.

### Asset Allocations (`asset_allocations`)
Logs custody handovers, return schedules, and asset condition checks.
- `id` `UUID`: Primary key.
- `asset_id` `UUID`: Foreign key `assets.id`.
- `employee_id` `UUID`: Foreign key `users.id`.
- `allocated_date` `DATE` / `expected_return_date` `DATE` / `actual_return_date` `DATE`.
- `condition_before` / `condition_after` `ASSET_CONDITION`.
- `status` `ALLOCATION_STATUS`.

### Transfer Requests (`transfer_requests`)
Manages requests to transfer asset ownership between employees/departments.
- `id` `UUID`: Primary key.
- `asset_id` `UUID` / `requested_by_id` `UUID` / `from_employee_id` `UUID` / `to_employee_id` `UUID` / `approved_by_id` `UUID`.
- `status` `TRANSFER_STATUS`: Default `PENDING`.

### Resource Bookings (`resource_bookings`)
Manages calendar reservations for bookable assets (e.g. rooms, cars).
- `id` `UUID`: Primary key.
- `resource_id` `UUID` / `employee_id` `UUID`.
- `start_time` `TIMESTAMP` / `end_time` `TIMESTAMP` (check `end_time > start_time`).
- `purpose` `VARCHAR` / `notes` `TEXT`.
- `status` `BOOKING_STATUS`: Default `UPCOMING`.

### Maintenance Requests (`maintenance_requests`)
Service tickets for broken, damaged, or scheduled maintenance items.
- `id` `UUID`: Primary key.
- `asset_id` `UUID` / `raised_by_id` `UUID` / `assigned_technician_id` `UUID` / `approved_by_id` `UUID`.
- `description` `TEXT` / `priority` `MAINTENANCE_PRIORITY` / `status` `MAINTENANCE_STATUS`.
- `estimated_cost` `DECIMAL` / `actual_cost` `DECIMAL` (checks `>= 0`).

### Audit Cycles & Items (`audit_cycles`, `audit_items`)
- `audit_cycles`: Auditing cycle schedules, names, scopes, and compliance.
- `audit_items`: Verification logs per asset tag checked during the audit cycle.

### Notifications (`notifications`)
- `user_id` `UUID`: Foreign key `users.id`.
- `is_read` `BOOLEAN`: Default `FALSE`.

### Activity Logs (`activity_logs`)
- `user_id` `UUID`: Auditor.
- `metadata` `JSONB`: JSON schema data payload.

---

## 3. Performance Indexes

B-Tree indexes are created for all foreign keys, status columns, unique columns, search codes (`employee_code`, `asset_tag`), and booking date ranges. File: `schema/indexes.sql`.
