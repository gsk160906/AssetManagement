import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import pool from '../src/db/index.js';

const resetDatabase = async () => {
  console.log('Database Reset Started...');

  // 1. Safety Checks
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Error: Database reset is disabled in production.');
    process.exit(1);
  }

  if (process.env.ALLOW_DB_RESET !== 'true') {
    console.error('❌ Error: Database reset is not enabled. Set ALLOW_DB_RESET=true environment variable to confirm.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 2. Discover all public BASE TABLES dynamically
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '%migration%'
        AND table_name NOT IN ('pg_stat_statements')
    `;
    const res = await client.query(tableQuery);
    const tables = res.rows.map(row => `"${row.table_name}"`);

    if (tables.length > 0) {
      console.log(`Discovered ${tables.length} tables to truncate.`);
      
      // Perform cascade truncation and restart sequence identity values
      const truncateQuery = `TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE;`;
      await client.query(truncateQuery);

      console.log('✔ All application data cleared successfully.');
    } else {
      console.log('No tables found to reset.');
    }

    // 3. Clear public/uploads directory except .gitkeep
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file !== '.gitkeep') {
          const filePath = path.join(uploadsDir, file);
          try {
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.error(`Failed to delete local file ${file}:`, err.message);
          }
        }
      }
      console.log('✔ Local uploads directory cleared.');
    }

    await client.query('COMMIT');
    console.log('\nDatabase successfully reset.');
    console.log('System ready for first-time initialization.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

resetDatabase();
