const http = require('http');

function testLogin(email, password, role, label) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ email, password, role });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        console.log(`[${label}] Status: ${res.statusCode} | success: ${result.success} | msg: ${result.message || 'Login successful'}`);
        resolve(result);
      });
    });
    req.on('error', e => { console.error(label, e.message); resolve(null); });
    req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('\n=== BK TIMES LOGIN SECURITY TEST ===\n');

  // SHOULD PASS: correct email → correct portal
  await testLogin('admin@bk-times.com',    'bkadmin2026',    'admin',               '✅ ADMIN correct portal  ');
  await testLogin('village@bk-times.com',  'bkvillage2026',  'village_coordinator', '✅ VILLAGE correct portal');
  await testLogin('taluka@bk-times.com',   'bktaluka2026',   'taluka_coordinator',  '✅ TALUKA correct portal ');
  await testLogin('district@bk-times.com', 'bkdistrict2026', 'district_coordinator','✅ DISTRICT correct portal');
  await testLogin('zone@bk-times.com',     'bkzone2026',     'zone_coordinator',    '✅ ZONE correct portal   ');

  console.log('\n--- CROSS-LOGIN BLOCK TESTS (should ALL be DENIED) ---\n');

  // SHOULD FAIL: admin email → village portal
  await testLogin('admin@bk-times.com',    'bkadmin2026',    'village_coordinator', '🔴 ADMIN→Village (deny)  ');
  // SHOULD FAIL: village email → admin portal
  await testLogin('village@bk-times.com',  'bkvillage2026',  'admin',               '🔴 Village→Admin (deny)  ');
  // SHOULD FAIL: taluka email → district portal
  await testLogin('taluka@bk-times.com',   'bktaluka2026',   'district_coordinator','🔴 Taluka→District (deny)');
  // SHOULD FAIL: wrong password
  await testLogin('admin@bk-times.com',    'wrongpassword',  'admin',               '🔴 Wrong password (deny) ');
  // SHOULD FAIL: wrong email
  await testLogin('fake@test.com',         'bkadmin2026',    'admin',               '🔴 Wrong email (deny)    ');
}

runTests();
