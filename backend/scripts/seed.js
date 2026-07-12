import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import pool from '../src/db/index.js';
import { seedDepartments } from './seedDepartments.js';
import { seedUsers } from './seedUsers.js';
import { seedCategories } from './seedCategories.js';
import { seedAssets } from './seedAssets.js';
import { seedAllocations } from './seedAllocations.js';
import { seedBookings } from './seedBookings.js';
import { seedMaintenance } from './seedMaintenance.js';
import { seedNotifications } from './seedNotifications.js';
import { seedActivityLogs } from './seedActivityLogs.js';
import { seedAudits } from './seedAudits.js';

const main = async () => {
  console.log('🚀 Starting Database Seed orchestration...');
  
  const client = await pool.connect();
  console.log('✔ Connected');

  try {
    // Generate one dynamic bcrypt password hash for all users
    console.log('Generating dynamic password hash...');
    const passwordHash = await bcrypt.hash('Password123', 10);

    // Start database transaction
    await client.query('BEGIN');

    // 1. Wipe existing data in correct reverse foreign key dependency order
    await client.query('UPDATE departments SET manager_id = NULL');
    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM audit_items');
    await client.query('DELETE FROM audits');
    await client.query('DELETE FROM maintenance_requests');
    await client.query('DELETE FROM resource_bookings');
    await client.query('DELETE FROM transfer_requests');
    await client.query('DELETE FROM asset_allocations');
    await client.query('DELETE FROM assets');
    await client.query('DELETE FROM asset_categories');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM departments');
    console.log('✔ Deleted existing data');

    // 2. Execute modular seed functions inside the transaction block
    await seedDepartments(client);
    console.log('✔ Seeded Departments');

    await seedUsers(client, passwordHash);
    console.log('✔ Seeded Users');

    await seedCategories(client);
    console.log('✔ Seeded Categories');

    await seedAssets(client);
    console.log('✔ Seeded Assets');

    await seedAllocations(client);
    console.log('✔ Seeded Allocations');

    await seedBookings(client);
    console.log('✔ Seeded Bookings');

    await seedMaintenance(client);
    console.log('✔ Seeded Maintenance');

    await seedNotifications(client);
    console.log('✔ Seeded Notifications');

    await seedActivityLogs(client);
    console.log('✔ Seeded Activity Logs');

    await seedAudits(client);
    console.log('✔ Seeded Audits');

    // Commit changes
    await client.query('COMMIT');
    console.log('✔ Database Seed Completed Successfully');
  } catch (error) {
    // Rollback transaction on failure
    await client.query('ROLLBACK');
    console.error('❌ Database Seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Release PG client
    client.release();
    await pool.end();
  }
};

main();
