DROP TABLE IF EXISTS maintenance_requests CASCADE;
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT NOT NULL,
    raised_by_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    description TEXT NOT NULL,
    priority MAINTENANCE_PRIORITY DEFAULT 'MEDIUM' NOT NULL,
    status MAINTENANCE_STATUS DEFAULT 'PENDING' NOT NULL,
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL NULL,
    approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL NULL,
    estimated_cost DECIMAL(12, 2) DEFAULT 0.00 NOT NULL CHECK (estimated_cost >= 0),
    actual_cost DECIMAL(12, 2) DEFAULT 0.00 NOT NULL CHECK (actual_cost >= 0),
    completed_date TIMESTAMP NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

