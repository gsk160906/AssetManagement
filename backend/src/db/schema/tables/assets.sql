DROP TABLE IF EXISTS assets CASCADE;
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category_id UUID REFERENCES asset_categories(id) ON DELETE RESTRICT NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    acquisition_date DATE NOT NULL,
    acquisition_cost DECIMAL(12, 2) NOT NULL CHECK (acquisition_cost >= 0),
    warranty_expiry_date DATE NULL,
    condition ASSET_CONDITION DEFAULT 'EXCELLENT' NOT NULL,
    status ASSET_STATUS DEFAULT 'AVAILABLE' NOT NULL,
    current_department_id UUID REFERENCES departments(id) ON DELETE RESTRICT NULL,
    current_location VARCHAR(255) NULL,
    is_shared_bookable BOOLEAN DEFAULT FALSE NOT NULL,
    image_url VARCHAR(255) NULL,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_warranty_date CHECK (warranty_expiry_date IS NULL OR warranty_expiry_date >= acquisition_date)
);

