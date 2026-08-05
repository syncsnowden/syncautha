const API_KEY = "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const PASTEFY_BASE = "https://pastefy.app/api/v2";

async function run() {
  const masterId = "7golktjL";
  try {
    const contentRes = await fetch(`${PASTEFY_BASE}/paste/${masterId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (contentRes.ok) {
      const cd = await contentRes.json();
      console.log("Master Paste data:", JSON.stringify(cd, null, 2));
    } else {
      console.error("Failed to read master:", contentRes.status, await contentRes.text());
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
