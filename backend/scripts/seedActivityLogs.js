export const seedActivityLogs = async (client) => {
  const logs = [
    ['e1000000-0000-0000-0000-000000000000', 'CREATE', 'DEPARTMENTS', 'departments', 'd1000000-0000-0000-0000-000000000001', JSON.stringify({ name: 'Information Technology' })],
    ['e1000000-0000-0000-0000-000000000000', 'CREATE', 'USERS', 'users', 'e1000000-0000-0000-0000-000000000000', JSON.stringify({ role: 'ADMIN', email: 'admin@assetflow.com' })],
    ['e1000000-0000-0000-0000-000000000000', 'CREATE', 'CATEGORIES', 'asset_categories', 'c1000000-0000-0000-0000-000000000001', JSON.stringify({ name: 'Computing Hardware' })],
    ['e1000000-0000-0000-0000-000000000000', 'CREATE', 'ASSETS', 'assets', 'a1000000-0000-0000-0000-000000000001', JSON.stringify({ tag: 'AST-IT-001', model: 'XPS 15' })],
    ['e1000000-0000-0000-0000-000000000000', 'CREATE', 'ASSETS', 'assets', 'a1000000-0000-0000-0000-000000000002', JSON.stringify({ tag: 'AST-IT-002', model: 'XPS 15' })],
    ['e1000000-0000-0000-0000-000000000001', 'ALLOCATE', 'ALLOCATIONS', 'asset_allocations', '1', JSON.stringify({ asset_id: 'a1000000-0000-0000-0000-000000000002', user_id: 'e1000000-0000-0000-0000-000000000002' })],
    ['e1000000-0000-0000-0000-000000000003', 'BOOK', 'BOOKINGS', 'resource_bookings', '1', JSON.stringify({ resource_id: 'a1000000-0000-0000-0000-000000000011', purpose: 'HR Board Meeting' })],
    ['e1000000-0000-0000-0000-000000000001', 'MAINTENANCE_TICKET', 'MAINTENANCE', 'maintenance_requests', '1', JSON.stringify({ asset_id: 'a1000000-0000-0000-0000-000000000018', priority: 'HIGH' })],
    ['e1000000-0000-0000-0000-000000000001', 'RESOLVE_TICKET', 'MAINTENANCE', 'maintenance_requests', '3', JSON.stringify({ asset_id: 'a1000000-0000-0000-0000-000000000014', cost: 45.00 })],
    ['e1000000-0000-0000-0000-000000000002', 'UPDATE', 'USERS', 'users', 'e1000000-0000-0000-0000-000000000002', JSON.stringify({ fields_changed: ['phone_number'] })]
  ];

  for (const log of logs) {
    await client.query(
      'INSERT INTO activity_logs (user_id, action, module, entity, entity_id, metadata) VALUES ($1, $2, $3, $4, $5, $6)',
      log
    );
  }
};
