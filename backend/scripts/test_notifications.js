async function test() {
  try {
    const loginRes = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@assetflow.com',
        password: 'Password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.token;
    if (!token) {
      console.error('Failed to get token:', loginData);
      return;
    }
    console.log('✓ Login successful');

    // 1. Fetch notification count
    const countRes = await fetch('http://127.0.0.1:5000/api/v1/notifications/count', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const countData = await countRes.json();
    console.log('✓ Fetch count success:', countData.success, 'Data:', countData.data);

    // 2. Fetch preferences
    const prefRes = await fetch('http://127.0.0.1:5000/api/v1/notifications/preferences', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const prefData = await prefRes.json();
    console.log('✓ Fetch preferences success:', prefData.success, 'Preferences:', prefData.data?.preferences);

    // 3. Update preferences (disable MAINTENANCE)
    const updatePrefRes = await fetch('http://127.0.0.1:5000/api/v1/notifications/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        maintenance_enabled: false
      })
    });
    const updatePrefData = await updatePrefRes.json();
    console.log('Update preferences response:', JSON.stringify(updatePrefData, null, 2));

    // 4. Fetch notifications list
    const listRes = await fetch('http://127.0.0.1:5000/api/v1/notifications?page=1&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();
    console.log('✓ Fetch notifications list success:', listData.success, `Count: ${listData.data?.notifications?.length}`);

  } catch (err) {
    console.error('Error during notifications test:', err);
  }
}

test();
