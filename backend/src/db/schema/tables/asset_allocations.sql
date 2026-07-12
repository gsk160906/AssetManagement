DROP TABLE IF EXISTS asset_allocations CASCADE;
CREATE TABLE asset_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT NOT NULL,
    employee_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    allocated_date DATE DEFAULT CURRENT_DATE NOT NULL,
    expected_return_date DATE NULL,
    actual_return_date DATE NULL,
    condition_before ASSET_CONDITION DEFAULT 'GOOD' NOT NULL,
    condition_after ASSET_CONDITION NULL,
    status ALLOCATION_STATUS DEFAULT 'ACTIVE' NOT NULL,
    notes TEXT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_expected_return CHECK (expected_return_date IS NULL OR expected_return_date >= allocated_date),
    CONSTRAINT chk_actual_return CHECK (actual_return_date IS NULL OR actual_return_date >= allocated_date)
);

