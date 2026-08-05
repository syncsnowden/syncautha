const API_KEY = "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const PASTEFY_BASE = "https://pastefy.app/api/v2";

async function run() {
  try {
    const listRes = await fetch(`${PASTEFY_BASE}/paste?limit=10`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const text = await listRes.text();
    console.log(text.slice(0, 2000));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
