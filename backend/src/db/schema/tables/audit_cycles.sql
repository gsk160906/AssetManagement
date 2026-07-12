DROP TABLE IF EXISTS audit_cycles CASCADE;
CREATE TABLE audit_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    scope TEXT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status AUDIT_STATUS DEFAULT 'PLANNED' NOT NULL,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_audit_dates CHECK (end_date >= start_date)
);

