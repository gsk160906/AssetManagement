import pool from '../src/db/index.js';

async function run() {
  const client = await pool.connect();
  try {
    console.log('Dropping/Creating audits tables...');
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS audit_logs CASCADE;');
    await client.query('DROP TABLE IF EXISTS audit_items CASCADE;');
    await client.query('DROP TABLE IF EXISTS audits CASCADE;');
    await client.query('DROP TABLE IF EXISTS audit_cycles CASCADE;');

    await client.query(`
      CREATE TABLE audits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        audit_code VARCHAR(50) UNIQUE NOT NULL,
        audit_name VARCHAR(150) NOT NULL,
        description TEXT,
        auditor_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
        status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
        audit_type VARCHAR(30) DEFAULT 'full' CHECK (audit_type IN ('full', 'department', 'location', 'random')),
        start_date DATE NOT NULL,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE audit_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        audit_id UUID REFERENCES audits(id) ON DELETE CASCADE NOT NULL,
        asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT NOT NULL,
        expected_location TEXT,
        actual_location TEXT,
        verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('verified', 'missing', 'damaged', 'relocated', 'not_found', 'pending')),
        verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
        verified_at TIMESTAMP,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT uq_audit_asset UNIQUE (audit_id, asset_id)
      );
    `);

    await client.query(`
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        audit_id UUID REFERENCES audits(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await client.query('COMMIT');
    console.log('✓ Tables created successfully');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

run();
