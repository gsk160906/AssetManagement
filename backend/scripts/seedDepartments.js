export const seedDepartments = async (client) => {
  const departments = [
    ['d1000000-0000-0000-0000-000000000001', 'Information Technology', 'ACTIVE'],
    ['d1000000-0000-0000-0000-000000000002', 'Human Resources', 'ACTIVE'],
    ['d1000000-0000-0000-0000-000000000003', 'Finance & Accounting', 'ACTIVE'],
  ];

  for (const dept of departments) {
    await client.query(
      'INSERT INTO departments (id, name, parent_id, manager_id, status) VALUES ($1, $2, NULL, NULL, $3)',
      dept
    );
  }
};
