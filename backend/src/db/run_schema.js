import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlFiles = [
  'schema/enums.sql',
  'schema/tables/departments.sql',
  'schema/tables/users.sql',
  'schema/tables/asset_categories.sql',
  'schema/tables/assets.sql',
  'schema/tables/asset_allocations.sql',
  'schema/tables/transfer_requests.sql',
  'schema/tables/resource_bookings.sql',
  'schema/tables/maintenance_requests.sql',
  'schema/tables/audit_cycles.sql',
  'schema/tables/audit_items.sql',
  'schema/tables/notifications.sql',
  'schema/tables/activity_logs.sql',
  'schema/indexes.sql',
  'seed/seed_data.sql',
];

const runSchema = async () => {
  console.log('🚀 Starting Database Schema & Seed Initialization on Neon...');
  
  try {
    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, file);
      console.log(`Executing SQL file: ${file}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the raw SQL transaction against Neon
      await pool.query(sql);
      console.log(`✓ Completed: ${file}`);
    }
    
    console.log('🎉 Database Setup & Seeding successfully completed!');
  } catch (error) {
    console.error('❌ Database Configuration failed:', error.message);
  } finally {
    // Release pg client pool
    await pool.end();
  }
};

runSchema();
