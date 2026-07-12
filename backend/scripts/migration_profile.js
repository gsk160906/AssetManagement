import dotenv from 'dotenv';
dotenv.config();

import pool from '../src/db/index.js';

const migrate = async () => {
  console.log('🚀 Running Profile & Settings Module Database Migration...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Add new columns to users table
    console.log('Altering users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS designation VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS bio TEXT NULL,
      ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC' NOT NULL,
      ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English' NOT NULL,
      ADD COLUMN IF NOT EXISTS date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD' NOT NULL,
      ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'SYSTEM' NOT NULL,
      ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
    `);

    // 2. Create user_preferences table
    console.log('Creating user_preferences table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
          default_dashboard VARCHAR(50) DEFAULT 'dashboard' NOT NULL,
          default_page_size INTEGER DEFAULT 10 NOT NULL,
          email_notifications BOOLEAN DEFAULT FALSE NOT NULL,
          browser_notifications BOOLEAN DEFAULT TRUE NOT NULL,
          maintenance_notifications BOOLEAN DEFAULT TRUE NOT NULL,
          booking_notifications BOOLEAN DEFAULT TRUE NOT NULL,
          audit_notifications BOOLEAN DEFAULT TRUE NOT NULL,
          report_notifications BOOLEAN DEFAULT TRUE NOT NULL,
          system_notifications BOOLEAN DEFAULT TRUE NOT NULL,
          asset_notifications BOOLEAN DEFAULT TRUE NOT NULL,
          compact_mode BOOLEAN DEFAULT FALSE NOT NULL,
          theme VARCHAR(20) DEFAULT 'SYSTEM' NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    // 3. Migrate data from notification_preferences if it exists
    console.log('Checking for old notification_preferences to migrate...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notification_preferences'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('Migrating old notification preferences into user_preferences...');
      await client.query(`
        INSERT INTO user_preferences (
            user_id,
            email_notifications,
            browser_notifications,
            maintenance_notifications,
            booking_notifications,
            audit_notifications,
            report_notifications,
            system_notifications,
            asset_notifications
        )
        SELECT 
            user_id,
            email_enabled,
            browser_enabled,
            maintenance_enabled,
            booking_enabled,
            audit_enabled,
            report_enabled,
            system_enabled,
            asset_enabled
        FROM notification_preferences
        ON CONFLICT (user_id) DO NOTHING;
      `);

      console.log('Dropping old notification_preferences table...');
      await client.query('DROP TABLE IF EXISTS notification_preferences CASCADE;');
    }

    // 4. Create user_sessions table
    console.log('Creating user_sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          refresh_token VARCHAR(500) UNIQUE NOT NULL,
          device_name VARCHAR(255) NULL,
          browser VARCHAR(255) NULL,
          operating_system VARCHAR(255) NULL,
          ip_address VARCHAR(50) NULL,
          location VARCHAR(255) NULL,
          last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    // 5. Populate first_name and last_name for existing users
    console.log('Populating first/last name values...');
    await client.query(`
      UPDATE users 
      SET first_name = split_part(name, ' ', 1),
          last_name = COALESCE(nullif(split_part(name, ' ', 2), ''), 'User')
      WHERE first_name IS NULL;
    `);

    // 6. Ensure all users have a preferences record
    console.log('Initializing user preferences...');
    await client.query(`
      INSERT INTO user_preferences (user_id)
      SELECT id FROM users
      ON CONFLICT (user_id) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('✔ Migration finished successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
