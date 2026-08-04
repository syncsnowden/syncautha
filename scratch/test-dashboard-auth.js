const http = require('http');

function post(path, dataObj) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(dataObj);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, cookieStr) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Cookie': cookieStr
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  try {
    const rand = Math.floor(Math.random() * 10000);
    const username = `cooluser_${rand}`;
    const email = `cooluser_${rand}@example.com`;
    const password = 'password12345';

    console.log(`Registering ${username}...`);
    await post('/api/auth/register', { username, email, password });

    console.log(`Logging in...`);
    const loginRes = await post('/api/auth/login', { identifier: username, password, remember: true });
    console.log(`Login Status: ${loginRes.statusCode}`);
    
    const setCookieHeaders = loginRes.headers['set-cookie'] || [];
    console.log(`Cookies returned from login:`, setCookieHeaders);
    
    // Parse cookies into a single Cookie header string
    const cookies = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
    console.log(`Sending Cookie header:`, cookies);
    
    console.log(`Fetching /dashboard with auth cookies...`);
    const dashRes = await get('/dashboard', cookies);
    console.log(`Dashboard Status: ${dashRes.statusCode}`);
    console.log(`Dashboard Body Length: ${dashRes.body.length}`);
    if (dashRes.statusCode === 500) {
      console.log(`Dashboard Body (first 2000 chars):`, dashRes.body.slice(0, 2000));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
