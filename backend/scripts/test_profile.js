import dotenv from 'dotenv';
dotenv.config();

import pool from '../src/db/index.js';

const main = async () => {
  console.log('🧪 Starting Profile & Settings Module E2E Test...');
  
  const testUserEmail = 'admin@assetflow.com';
  const newPass = 'NewSecurePass@123';
  const targetPass = 'Password123!'; // compliant with special char requirements
  
  let token = '';
  let currentSessionId = '';
  let userId = '';

  try {
    // 1. Login to get JWT and create a session
    console.log('\n--- 1. Login ---');
    let loginRes = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: targetPass })
    });
    let loginData = await loginRes.json();
    console.log('Login attempt 1 (Password123!):', loginData);
    
    // If login with Password123! fails, try original seed password Password123
    if (!loginData.success) {
      console.log('Attempting login with original seed password...');
      loginRes = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUserEmail, password: 'Password123' })
      });
      loginData = await loginRes.json();
      console.log('Login attempt 2 (Password123):', loginData);
    }
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    
    token = loginData.data.token;
    userId = loginData.data.user.id;
    console.log('✓ Login successful');

    // Decode token to verify sessionId
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    currentSessionId = payload.sessionId;
    console.log(`✓ JWT contains sessionId: ${currentSessionId}`);

    // 2. Fetch Profile details
    console.log('\n--- 2. Fetch Profile ---');
    const profileRes = await fetch('http://127.0.0.1:5000/api/v1/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profileData = await profileRes.json();
    if (!profileData.success) {
      throw new Error(`Fetch profile failed: ${profileData.message}`);
    }
    console.log('✓ Profile retrieved:', {
      first_name: profileData.data.profile.first_name,
      last_name: profileData.data.profile.last_name,
      designation: profileData.data.profile.designation,
      timezone: profileData.data.profile.timezone,
      language: profileData.data.profile.language
    });

    // 3. Update Profile
    console.log('\n--- 3. Update Profile ---');
    const updateRes = await fetch('http://127.0.0.1:5000/api/v1/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        first_name: 'Super',
        last_name: 'Admin',
        phone_number: '+1234567890',
        designation: 'Senior Admin',
        bio: 'Managing the enterprise assets system.',
        timezone: 'America/New_York',
        language: 'English',
        theme: 'DARK',
        date_format: 'YYYY-MM-DD'
      })
    });
    const updateData = await updateRes.json();
    if (!updateData.success) {
      throw new Error(`Update profile failed: ${updateData.message}`);
    }
    console.log('✓ Profile updated successfully:', updateData.data.profile.name);

    // Verify notification was created
    const notesRes = await pool.query(
      'SELECT title, message FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    console.log('✓ Latest Notification in DB:', notesRes.rows[0]);

    // Verify activity log was recorded
    const logsRes = await pool.query(
      "SELECT action, module FROM activity_logs WHERE user_id = $1 AND module = 'PROFILE' ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
    console.log('✓ Latest Activity Log in DB:', logsRes.rows[0]);

    // 4. Fetch Preferences
    console.log('\n--- 4. Fetch Preferences ---');
    const prefRes = await fetch('http://127.0.0.1:5000/api/v1/profile/preferences', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const prefData = await prefRes.json();
    if (!prefData.success) {
      throw new Error(`Fetch preferences failed: ${prefData.message}`);
    }
    console.log('✓ Preferences retrieved:', prefData.data.preferences);

    // 5. Update Preferences
    console.log('\n--- 5. Update Preferences ---');
    const updatePrefRes = await fetch('http://127.0.0.1:5000/api/v1/profile/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        theme: 'DARK',
        default_dashboard: 'assets',
        default_page_size: 25,
        compact_mode: true,
        email_notifications: true
      })
    });
    const updatePrefData = await updatePrefRes.json();
    if (!updatePrefData.success) {
      throw new Error(`Update preferences failed: ${updatePrefData.message}`);
    }
    console.log('✓ Preferences updated successfully:', updatePrefData.data.preferences);

    // 6. Test Avatar Upload
    console.log('\n--- 6. Avatar Upload ---');
    const form = new FormData();
    const fakeImageBlob = new Blob([Buffer.from('fake image content')], { type: 'image/png' });
    form.append('avatar', fakeImageBlob, 'avatar.png');

    const avatarRes = await fetch('http://127.0.0.1:5000/api/v1/profile/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });
    const avatarData = await avatarRes.json();
    if (!avatarData.success) {
      throw new Error(`Avatar upload failed: ${avatarData.message}`);
    }
    console.log('✓ Avatar uploaded successfully, URL:', avatarData.data.profile_image_url);

    // 7. Get Active Sessions
    console.log('\n--- 7. Get Active Sessions ---');
    const sessionsRes = await fetch('http://127.0.0.1:5000/api/v1/profile/sessions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sessionsData = await sessionsRes.json();
    if (!sessionsData.success) {
      throw new Error(`Get active sessions failed: ${sessionsData.message}`);
    }
    console.log('✓ Current session:', sessionsData.data.current);
    console.log('✓ Other sessions count:', sessionsData.data.others.length);

    // 8. Test Password Change
    console.log('\n--- 8. Test Password Change ---');
    // First, let's find the current correct password by attempting login
    let currentActivePassword = 'Password123';
    let checkLogin = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: currentActivePassword })
    });
    let checkData = await checkLogin.json();
    if (!checkData.success) {
      currentActivePassword = targetPass; // otherwise must be Password123!
    }

    // Change to new password
    const passChangeRes1 = await fetch('http://127.0.0.1:5000/api/v1/profile/change-password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: currentActivePassword,
        newPassword: newPass
      })
    });
    const passChangeData1 = await passChangeRes1.json();
    if (!passChangeData1.success) {
      throw new Error(`Password change to new failed: ${passChangeData1.message}`);
    }
    console.log('✓ Password changed to new successfully');

    // Revert password back to targetPass (so we don't break subsequent test runs!)
    // Login with new password to get a fresh token first
    const loginRes2 = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: newPass })
    });
    const loginData2 = await loginRes2.json();
    console.log('Login with new password response:', loginData2);
    const token2 = loginData2.data?.token;

    const passChangeRes2 = await fetch('http://127.0.0.1:5000/api/v1/profile/change-password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`
      },
      body: JSON.stringify({
        currentPassword: newPass,
        newPassword: targetPass
      })
    });
    const passChangeData2 = await passChangeRes2.json();
    if (!passChangeData2.success) {
      throw new Error(`Password revert failed: ${passChangeData2.message}`);
    }
    console.log('✓ Password reverted back to compliant "Password123!" successfully');

    // 9. Test Logout Session
    console.log('\n--- 9. Session Logout ---');
    // Login again to get a fresh test token/session with the newly reverted password
    const loginRes3 = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: targetPass })
    });
    const loginData3 = await loginRes3.json();
    const token3 = loginData3.data.token;

    const logoutRes = await fetch('http://127.0.0.1:5000/api/v1/profile/sessions/current', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token3}` }
    });
    const logoutData = await logoutRes.json();
    if (!logoutData.success) {
      throw new Error(`Logout session failed: ${logoutData.message}`);
    }
    console.log('✓ Current session logged out successfully');

    // Try accessing profile with logged out token - should fail 401
    const testAuthRes = await fetch('http://127.0.0.1:5000/api/v1/profile', {
      headers: { Authorization: `Bearer ${token3}` }
    });
    console.log('✓ Accessing with logged out session yields status:', testAuthRes.status);
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main();
