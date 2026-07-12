export const seedAllocations = async (client) => {
  const allocations = [
    ['a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', '2025-01-16', '2027-01-16', null, 'GOOD', null, 'ACTIVE', 'Standard workstation allocation for developer workflow'],
    ['a1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000004', '2024-05-15', '2026-05-15', null, 'GOOD', null, 'ACTIVE', 'HR Coordinator laptop'],
    ['a1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000007', '2024-05-15', '2026-05-15', null, 'GOOD', null, 'ACTIVE', 'Finance Accountant desktop replacement'],
    ['a1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000005', '2025-03-02', '2026-03-02', null, 'EXCELLENT', null, 'ACTIVE', 'Company cellular allocation for HR support'],
    ['a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '2025-01-16', '2025-03-16', '2025-03-15', 'EXCELLENT', 'EXCELLENT', 'RETURNED', 'Returned early prior to transition']
  ];

  for (const alloc of allocations) {
    await client.query(
      `INSERT INTO asset_allocations (
        asset_id, employee_id, allocated_date, expected_return_date, actual_return_date, 
        condition_before, condition_after, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      alloc
    );
  }
};
