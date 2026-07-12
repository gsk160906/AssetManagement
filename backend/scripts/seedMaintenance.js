export const seedMaintenance = async (client) => {
  const maintenance = [
    ['a1000000-0000-0000-0000-000000000018', 'e1000000-0000-0000-0000-000000000001', 'Transmission fluid leak and check engine light active', 'HIGH', 'IN_PROGRESS', 'e1000000-0000-0000-0000-000000000002', 450.00, 0.00, null],
    ['a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'Screen flicker when running high graphics workloads', 'MEDIUM', 'PENDING', null, 150.00, 0.00, null],
    ['a1000000-0000-0000-0000-000000000014', 'e1000000-0000-0000-0000-000000000003', 'Door glass latch loose in acoustic pod', 'LOW', 'RESOLVED', 'e1000000-0000-0000-0000-000000000001', 50.00, 45.00, '2026-06-20 14:00:00']
  ];

  for (const maint of maintenance) {
    await client.query(
      `INSERT INTO maintenance_requests (
        asset_id, raised_by_id, description, priority, status, assigned_technician_id, 
        estimated_cost, actual_cost, completed_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      maint
    );
  }
};
