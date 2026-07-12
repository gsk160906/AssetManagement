import pool from '../src/db/index.js';

async function run() {
  const client = await pool.connect();
  try {
    console.log('Creating report_history table...');
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS report_history CASCADE;');
    await client.query(`
      CREATE TABLE report_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        report_type VARCHAR(50) NOT NULL,
        file_format VARCHAR(10) CHECK (file_format IN ('CSV', 'PDF')),
        filters JSONB,
        file_name VARCHAR(255),
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query('COMMIT');
    console.log('✓ report_history table created successfully');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating report_history table:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

run();
