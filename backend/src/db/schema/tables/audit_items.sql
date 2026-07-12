DROP TABLE IF EXISTS audit_items CASCADE;
CREATE TABLE audit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_cycle_id UUID REFERENCES audit_cycles(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT NOT NULL,
    auditor_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    verification_result VERIFICATION_STATUS DEFAULT 'VERIFIED' NOT NULL,
    remarks TEXT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uq_audit_cycle_asset UNIQUE (audit_cycle_id, asset_id)
);

