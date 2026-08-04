const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/login',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Body Length: ${body.length}`);
    console.log(`Body (first 1000 chars):`, body.slice(0, 1000));
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
