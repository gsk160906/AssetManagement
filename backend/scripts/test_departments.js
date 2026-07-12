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

    const listRes = await fetch('http://localhost:5000/api/v1/departments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();
    const dept = listData.data?.departments?.[0];
    if (dept) {
      console.log('Testing GET /departments/' + dept.id);
      const detailRes = await fetch(`http://localhost:5000/api/v1/departments/${dept.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const detailData = await detailRes.json();
      console.log('Detail response:', JSON.stringify(detailData, null, 2));

      console.log('Testing GET /departments/' + dept.id + '/employees');
      const empRes = await fetch(`http://localhost:5000/api/v1/departments/${dept.id}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empData = await empRes.json();
      console.log('Employees response:', JSON.stringify(empData, null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
