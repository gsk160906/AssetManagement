async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
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

    const endpoints = ['assets', 'maintenance', 'audits', 'bookings', 'expenses'];
    for (const ep of endpoints) {
      const res = await fetch(`http://localhost:5000/api/v1/reports/${ep}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      console.log(`Endpoint: /reports/${ep} -> success:`, resData.success);
      if (!resData.success) {
        console.error(`Error details for ${ep}:`, resData.message);
      }
    }
  } catch (err) {
    console.error('Error during API test:', err);
  }
}

test();
