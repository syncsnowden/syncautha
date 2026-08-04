const http = require('http');

http.get('http://localhost:3000/login', (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Body length: ${data.length}`);
    if (res.statusCode >= 400) {
      console.log('Error Body Preview:', data.slice(0, 1000));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err);
});
