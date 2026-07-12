import pool from '../src/db/index.js';

async function run() {
  const client = await pool.connect();
  try {
    console.log('Running notifications table updates and preferences migrations...');
    await client.query('BEGIN');

    // 1. Alter notifications table to add missing fields
    await client.query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'SYSTEM' CHECK (category IN ('ASSET', 'MAINTENANCE', 'BOOKING', 'AUDIT', 'REPORT', 'SYSTEM', 'SECURITY', 'TRANSFER')),
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
      ADD COLUMN IF NOT EXISTS read_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS action_url TEXT,
      ADD COLUMN IF NOT EXISTS action_label VARCHAR(100),
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
    `);

    // 2. Create notification_preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        maintenance_enabled BOOLEAN DEFAULT TRUE NOT NULL,
        booking_enabled BOOLEAN DEFAULT TRUE NOT NULL,
        audit_enabled BOOLEAN DEFAULT TRUE NOT NULL,
        report_enabled BOOLEAN DEFAULT TRUE NOT NULL,
        asset_enabled BOOLEAN DEFAULT TRUE NOT NULL,
        system_enabled BOOLEAN DEFAULT TRUE NOT NULL,
        email_enabled BOOLEAN DEFAULT FALSE NOT NULL,
        browser_enabled BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await client.query('COMMIT');
    console.log('✓ Notifications migrations ran successfully.');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error running notifications migrations:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

run();
