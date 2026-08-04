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
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  try {
    const rand = Math.floor(Math.random() * 10000);
    const username = `cooluser_${rand}`;
    const email = `cooluser_${rand}@example.com`;
    const password = 'password12345';

    console.log(`Registering ${username} (${email})...`);
    const regRes = await post('/api/auth/register', { username, email, password });
    console.log(`Register Status: ${regRes.statusCode}, Body: ${regRes.body}`);

    console.log(`Attempting login with username ${username}...`);
    const logRes = await post('/api/auth/login', { identifier: username, password, remember: true });
    console.log(`Login Status: ${logRes.statusCode}, Body: ${logRes.body}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
