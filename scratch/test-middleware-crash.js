const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/dashboard',
  method: 'GET',
  headers: {
    'Cookie': 'sb-yqxodkejfqfjoeobedej-auth-token=base64-invalidjwtpayloadhere'
  }
};

http.get(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Body length: ${data.length}`);
    if (res.statusCode >= 400) {
      console.log('Body Preview:', data.slice(0, 1000));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err);
});
