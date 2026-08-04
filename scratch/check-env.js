const fs = require('fs');
const path = require('path');

function checkEnv() {
  console.log('Checking environment variables...');
  
  // 1. Process environment variables
  const envs = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  for (const [key, val] of Object.entries(envs)) {
    if (val) {
      console.log(`- ${key}: SET (Length: ${val.length}, Starts with: "${val.slice(0, 10)}...")`);
    } else {
      console.log(`- ${key}: NOT SET`);
    }
  }

  // 2. Read .env.local file directly to check if it's there
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    console.log(`.env.local exists at ${envPath}`);
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        console.log(`  File defines: ${key} (Length: ${value.length})`);
      }
    }
  } else {
    console.log(`.env.local does NOT exist in process.cwd()!`);
  }
}

checkEnv();
