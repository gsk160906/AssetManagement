DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role USER_ROLE DEFAULT 'EMPLOYEE' NOT NULL,
    status USER_STATUS DEFAULT 'ACTIVE' NOT NULL,
    phone_number VARCHAR(20) NULL,
    profile_image VARCHAR(255) NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Establish manager foreign key relationship on departments
ALTER TABLE departments 
DROP CONSTRAINT IF EXISTS fk_departments_manager;

ALTER TABLE departments
ADD CONSTRAINT fk_departments_manager
FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

