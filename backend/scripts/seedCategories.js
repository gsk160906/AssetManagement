export const seedCategories = async (client) => {
  const categories = [
    ['c1000000-0000-0000-0000-000000000001', 'Computing Hardware', 'Laptops, desktops, and workstation tablets', 24, 'ACTIVE'],
    ['c1000000-0000-0000-0000-000000000002', 'Mobile Devices', 'Mobile phones and communications hardware', 12, 'ACTIVE'],
    ['c1000000-0000-0000-0000-000000000003', 'AV Equipment', 'Monitors, projectors, and audio soundbars', 36, 'ACTIVE'],
    ['c1000000-0000-0000-0000-000000000004', 'Office Furniture', 'Desks, ergonomic chairs, and acoustic pods', 60, 'ACTIVE'],
    ['c1000000-0000-0000-0000-000000000005', 'Company Vehicles', 'Delivery vans and corporate shared cars', 24, 'ACTIVE'],
  ];

  for (const cat of categories) {
    await client.query(
      'INSERT INTO asset_categories (id, name, description, default_warranty_months, status) VALUES ($1, $2, $3, $4, $5)',
      cat
    );
  }
};
