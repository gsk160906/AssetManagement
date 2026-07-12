export const seedNotifications = async (client) => {
  const notifications = [
    ['e1000000-0000-0000-0000-000000000002', 'ALLOCATION', 'Asset Assigned', 'Dell XPS 15 Laptop (AST-IT-002) has been assigned to you.', false],
    ['e1000000-0000-0000-0000-000000000004', 'ALLOCATION', 'Asset Assigned', 'Lenovo ThinkPad T14 (AST-HR-001) has been assigned to you.', true],
    ['e1000000-0000-0000-0000-000000000003', 'BOOKING', 'Booking Confirmed', 'Your reservation for Epson Projector (AST-AV-003) on 2026-07-15 has been confirmed.', false],
    ['e1000000-0000-0000-0000-000000000006', 'BOOKING', 'Booking Confirmed', 'Your reservation for Tesla Model 3 (AST-VEH-001) on 2026-07-16 has been confirmed.', false],
    ['e1000000-0000-0000-0000-000000000001', 'MAINTENANCE', 'Service Scheduled', 'Ford Transit (AST-VEH-003) repair ticket updated to In Progress.', false],
    ['e1000000-0000-0000-0000-000000000001', 'SYSTEM', 'Welcome to AssetFlow', 'System configuration completed successfully.', true],
    ['e1000000-0000-0000-0000-000000000003', 'TRANSFER', 'Transfer Pending', 'You have a pending asset transfer request for AST-IT-001.', false],
    ['e1000000-0000-0000-0000-000000000004', 'REMINDER', 'Expected Return Approaching', 'Laptop expected return date is in 7 days.', false],
    ['e1000000-0000-0000-0000-000000000006', 'AUDIT', 'Audit cycle scheduled', 'An inventory reconciliation cycle is planned for IT resources next week.', false],
    ['e1000000-0000-0000-0000-000000000000', 'SYSTEM', 'New User Registered', 'Linda Martinez registered under employee code EMP-010.', false]
  ];

  for (const notif of notifications) {
    await client.query(
      'INSERT INTO notifications (user_id, type, title, message, is_read) VALUES ($1, $2, $3, $4, $5)',
      notif
    );
  }
};
