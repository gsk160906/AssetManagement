export const seedAudits = async (client) => {
  console.log('Seeding Audits...');

  // 1. Get Auditor User ID (Admin)
  const userRes = await client.query("SELECT id FROM users WHERE email = 'admin@assetflow.com'");
  const auditorId = userRes.rows[0]?.id;
  if (!auditorId) {
    console.warn('❌ Admin user not found, skipping audits seed.');
    return;
  }

  // 2. Get 10 Assets
  const assetsRes = await client.query("SELECT id, name, current_location FROM assets LIMIT 10");
  const assets = assetsRes.rows;
  if (assets.length < 10) {
    console.warn(`❌ Expected at least 10 assets, found ${assets.length}. Seed might be incomplete.`);
  }

  // 3. Create Audit 1: Completed
  const audit1Id = 'ad100000-0000-0000-0000-000000000001';
  await client.query(`
    INSERT INTO audits (id, audit_code, audit_name, description, auditor_id, status, audit_type, start_date, end_date)
    VALUES ($1, 'AUD-2026-001', 'Q1 Physical Asset Verification', 'Full Q1 inventory audit', $2, 'completed', 'full', '2026-01-10', '2026-01-15')
    ON CONFLICT (audit_code) DO NOTHING
  `, [audit1Id, auditorId]);

  // 4. Create Audit 2: In Progress
  const audit2Id = 'ad100000-0000-0000-0000-000000000002';
  await client.query(`
    INSERT INTO audits (id, audit_code, audit_name, description, auditor_id, status, audit_type, start_date)
    VALUES ($1, 'AUD-2026-002', 'Q2 IT Department Audit', 'IT department inventory checking', $2, 'in_progress', 'department', '2026-06-20')
    ON CONFLICT (audit_code) DO NOTHING
  `, [audit2Id, auditorId]);

  // 5. Seed Audit Items for Audit 1
  console.log('Seeding Audit Items...');
  let verifiedCount = 0;
  for (let i = 0; i < Math.min(assets.length, 10); i++) {
    const asset = assets[i];
    const expectedLoc = asset.current_location || 'IT Storage Room 1';
    let actualLoc = expectedLoc;
    let status = 'verified';
    
    // Create some discrepancies (90% accuracy: 9 verified, 1 relocated)
    if (i === 9) {
      actualLoc = 'Conference Hall A';
      status = 'relocated';
    }

    await client.query(`
      INSERT INTO audit_items (audit_id, asset_id, expected_location, actual_location, verification_status, verified_by, verified_at, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, '2026-01-12 14:00:00', $7)
      ON CONFLICT (audit_id, asset_id) DO NOTHING
    `, [audit1Id, asset.id, expectedLoc, actualLoc, status, auditorId, `Verified during Q1 audit: ${status}`]);
  }

  // 6. Seed Pending Audit Items for Audit 2 (in_progress)
  for (let i = 0; i < Math.min(assets.length, 5); i++) {
    const asset = assets[i];
    const expectedLoc = asset.current_location || 'IT Storage Room 1';
    await client.query(`
      INSERT INTO audit_items (audit_id, asset_id, expected_location, actual_location, verification_status)
      VALUES ($1, $2, $3, null, 'pending')
      ON CONFLICT (audit_id, asset_id) DO NOTHING
    `, [audit2Id, asset.id, expectedLoc]);
  }

  // 7. Seed Audit Logs
  console.log('Seeding Audit Logs...');
  const logs = [
    [audit1Id, auditorId, 'CREATE_AUDIT', 'Audit session AUD-2026-001 created.'],
    [audit1Id, auditorId, 'START_AUDIT', 'Audit session AUD-2026-001 started, assets initialized.'],
    [audit1Id, auditorId, 'VERIFY_ASSET', 'Asset verification completed for Q1 verification items.'],
    [audit1Id, auditorId, 'COMPLETE_AUDIT', 'Audit AUD-2026-001 successfully completed.'],
    [audit2Id, auditorId, 'START_AUDIT', 'Audit session AUD-2026-002 started.']
  ];

  for (const log of logs) {
    await client.query(`
      INSERT INTO audit_logs (audit_id, user_id, action, description)
      VALUES ($1, $2, $3, $4)
    `, log);
  }
};
