export const seedUsers = async (client, passwordHash) => {
  const users = [
    // 1 ADMIN
    ['e1000000-0000-0000-0000-000000000000', 'EMP-000', 'AssetFlow Admin', 'admin@assetflow.com', passwordHash, 'd1000000-0000-0000-0000-000000000001', 'ADMIN', 'ACTIVE'],
    // 2 IT Employees
    ['e1000000-0000-0000-0000-000000000001', 'EMP-001', 'David Smith', 'david.smith@assetflow.com', passwordHash, 'd1000000-0000-0000-0000-000000000001', 'ASSET_MANAGER', 'ACTIVE'],
    ['e1000000-0000-0000-0000-000000000002', 'EMP-002', 'Sarah Jenkins', 'sarah.jenkins@assetflow.com', passwordHash, 'd1000000-0000-0000-0000-000000000001', 'EMPLOYEE', 'ACTIVE'],
    // 3 HR Employees
    ['e1000000-0000-0000-0000-000000000003', 'EMP-003', 'Emma Watson', 'emma.watson@assetflow.com', passwordHash, 'd1000000-0000-0000-0000-000000000002', 'DEPARTMENT_HEAD', 'ACTIVE'],
    ['e1000000-0000-0000-0000-000000000004', 'EMP-004', 'Michael Chang', 'michael.chang@assetflow.com', passwordHash, 'd1000000-0000-0000-0000-000000000002', 'EMPLOYEE', 'ACTIVE'],
    ['e1000000-0000-0000-0000-000000000005', 'EMP-005', 'Olivia Davis', 'olivia.davis@assetflow.com', passwordHash, 'd1000000-0000-0000-0000-000000000002', 'EMPLOYEE', 'ACTIVE'],
    // 3 Finance Employees
    ['e1000000-0000-0000-0000-000000000006', 'EMP-006', 'James Wilson', 'james.wilson@assetflow.com', passwordHash, 'd1000000-0000-0000-0000-000000000003', 'DEPARTMENT_HEAD', 'ACTIVE'],
    ['e1000000-0000-0000-0000-000000000007', 'EMP-007', 'Robert Miller', 'robert.miller@assetflow.com', passwordHash, 'd1000000-0000-0000-0000-000000000003', 'EMPLOYEE', 'ACTIVE'],
    ['e1000000-0000-0000-0000-000000000008', 'EMP-008', 'Sophia Taylor', 'sophia.taylor@assetflow.com', passwordHash, 'd1000000-0000-0000-0000-000000000003', 'EMPLOYEE', 'ACTIVE'],
    // 2 Unassigned Employees
    ['e1000000-0000-0000-0000-000000000009', 'EMP-009', 'William Brown', 'william.brown@assetflow.com', passwordHash, null, 'EMPLOYEE', 'ACTIVE'],
    ['e1000000-0000-0000-0000-000000000010', 'EMP-010', 'Linda Martinez', 'linda.martinez@assetflow.com', passwordHash, null, 'EMPLOYEE', 'ACTIVE']
  ];

  for (const user of users) {
    await client.query(
      'INSERT INTO users (id, employee_code, name, email, password_hash, department_id, role, status, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        user[0], user[1], user[2], user[3], user[4], user[5], user[6], user[7],
        user[2].split(' ')[0], user[2].split(' ')[1] || 'User'
      ]
    );
    await client.query(
      'INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [user[0]]
    );
  }

  // Set manager links in departments table
  await client.query("UPDATE departments SET manager_id = 'e1000000-0000-0000-0000-000000000000' WHERE id = 'd1000000-0000-0000-0000-000000000001'");
  await client.query("UPDATE departments SET manager_id = 'e1000000-0000-0000-0000-000000000003' WHERE id = 'd1000000-0000-0000-0000-000000000002'");
  await client.query("UPDATE departments SET manager_id = 'e1000000-0000-0000-0000-000000000006' WHERE id = 'd1000000-0000-0000-0000-000000000003'");
};
