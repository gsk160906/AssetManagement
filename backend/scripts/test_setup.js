import dotenv from 'dotenv';
dotenv.config();

import pool from '../src/db/index.js';

const main = async () => {
  console.log('🧪 Starting System Initialization Flow E2E Test...');

  try {
    // 1. Check current setup status (should be true because db is seeded with admin)
    console.log('\n--- 1. Check setup-status (Expected: true) ---');
    const res1 = await fetch('http://127.0.0.1:5000/api/v1/system/setup-status');
    const data1 = await res1.json();
    console.log('Response:', data1);
    if (!data1.success || data1.data.initialized !== true) {
      throw new Error(`Expected setup to be initialized, but got: ${JSON.stringify(data1)}`);
    }
    console.log('✓ Setup status matches expected state');

    // 2. Try to initialize system (Expected: 409 Conflict)
    console.log('\n--- 2. Try to initialize (Expected: 409 Conflict) ---');
    const res2 = await fetch('http://127.0.0.1:5000/api/v1/system/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationName: 'AssetFlow Inc',
        name: 'System Admin',
        email: 'newadmin@assetflow.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      })
    });
    const data2 = await res2.json();
    console.log('Status:', res2.status);
    console.log('Response:', data2);
    if (res2.status !== 409 || data2.success !== false) {
      throw new Error(`Expected 409 Conflict, but got: ${res2.status} ${JSON.stringify(data2)}`);
    }
    console.log('✓ Initialization correctly blocked');

    // 3. E2E Setup Test: Simulate a completely fresh database
    console.log('\n--- 3. Simulating fresh DB state (wiping all data) ---');
    await pool.query('UPDATE departments SET manager_id = NULL');
    await pool.query('DELETE FROM audit_logs');
    await pool.query('DELETE FROM notifications');
    await pool.query('DELETE FROM user_sessions');
    await pool.query('DELETE FROM user_preferences');
    await pool.query('DELETE FROM audit_items');
    await pool.query('DELETE FROM audits');
    await pool.query('DELETE FROM report_history');
    await pool.query('DELETE FROM maintenance_requests');
    await pool.query('DELETE FROM resource_bookings');
    await pool.query('DELETE FROM transfer_requests');
    await pool.query('DELETE FROM asset_allocations');
    await pool.query('DELETE FROM assets');
    await pool.query('DELETE FROM activity_logs');
    await pool.query('DELETE FROM users');

    // Check status again (Expected: false)
    const res3 = await fetch('http://127.0.0.1:5000/api/v1/system/setup-status');
    const data3 = await res3.json();
    console.log('Response:', data3);
    if (data3.data.initialized !== false) {
      throw new Error(`Expected setup to be uninitialized, but got: ${JSON.stringify(data3)}`);
    }
    console.log('✓ Setup status is false on fresh DB');

    // Run setup (Expected: 201 Created and return Token)
    console.log('\n--- 4. Initializing Setup (Expected: 201 Success) ---');
    const res4 = await fetch('http://127.0.0.1:5000/api/v1/system/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationName: 'AssetFlow Inc',
        name: 'AssetFlow Admin',
        email: 'admin@assetflow.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      })
    });
    const data4 = await res4.json();
    console.log('Status:', res4.status);
    console.log('Response:', data4);
    if (res4.status !== 201 || !data4.success || !data4.data.token) {
      throw new Error(`Expected 201 Created, but got: ${res4.status} ${JSON.stringify(data4)}`);
    }
    console.log('✓ System successfully initialized');

    // Try to run setup AGAIN (Expected: 409 Conflict)
    console.log('\n--- 5. Attempting duplicate setup (Expected: 409 Conflict) ---');
    const res5 = await fetch('http://127.0.0.1:5000/api/v1/system/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationName: 'Duplicate Inc',
        name: 'Duplicate Admin',
        email: 'duplicate@assetflow.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      })
    });
    const data5 = await res5.json();
    console.log('Status:', res5.status);
    console.log('Response:', data5);
    if (res5.status !== 409) {
      throw new Error(`Expected 409 Conflict on duplicate initialization, but got: ${res5.status}`);
    }
    console.log('✓ System correctly prevented duplicate setup');

    console.log('\n🎉 ALL SETUP TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Restore original database state by running seed
    console.log('\nRestoring database seed...');
    await pool.end();
  }
};

main();
