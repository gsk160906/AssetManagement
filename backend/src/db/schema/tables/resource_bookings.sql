DROP TABLE IF EXISTS resource_bookings CASCADE;
CREATE TABLE resource_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES assets(id) ON DELETE RESTRICT NOT NULL,
    employee_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    notes TEXT NULL,
    status BOOKING_STATUS DEFAULT 'UPCOMING' NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_booking_times CHECK (end_time > start_time)
);

