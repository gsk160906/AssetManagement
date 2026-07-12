export const seedBookings = async (client) => {
  const bookings = [
    ['a1000000-0000-0000-0000-000000000011', 'e1000000-0000-0000-0000-000000000003', '2026-07-15 10:00:00', '2026-07-15 12:00:00', 'HR Board Meeting', 'Need projector configured for dual presentation', 'UPCOMING'],
    ['a1000000-0000-0000-0000-000000000016', 'e1000000-0000-0000-0000-000000000006', '2026-07-16 09:00:00', '2026-07-16 17:00:00', 'Client Visit - Audit Review', 'Travel to local regional subsidiary', 'UPCOMING'],
    ['a1000000-0000-0000-0000-000000000017', 'e1000000-0000-0000-0000-000000000001', '2026-07-12 08:00:00', '2026-07-12 18:00:00', 'Site Assessment', 'Shared vehicle booking', 'ONGOING']
  ];

  for (const book of bookings) {
    await client.query(
      `INSERT INTO resource_bookings (
        resource_id, employee_id, start_time, end_time, purpose, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      book
    );
  }
};
