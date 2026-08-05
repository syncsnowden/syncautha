const API_KEY = "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const PASTEFY_BASE = "https://pastefy.app/api/v2";

async function run() {
  try {
    // Let's get up to 1000 pastes by paginating or setting limit high
    let page = 1;
    let foundMasters = [];
    while (page <= 5) {
      console.log(`Fetching page ${page}...`);
      const listRes = await fetch(`${PASTEFY_BASE}/paste?limit=100&page=${page}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      if (!listRes.ok) {
        console.error("List failed:", listRes.status, await listRes.text());
        break;
      }
      const raw = await listRes.json();
      const items = Array.isArray(raw) ? raw : (raw.items || raw.data || []);
      if (items.length === 0) break;
      
      for (const item of items) {
        const p = item.paste || item;
        if (p.title === "syncauth-master") {
          foundMasters.push(p);
        }
      }
      page++;
    }
    
    console.log(`Found ${foundMasters.length} syncauth-master pastes:`);
    for (const p of foundMasters) {
      console.log(`ID: ${p.id}, Created: ${p.created_at}`);
      const contentRes = await fetch(`${PASTEFY_BASE}/paste/${p.id}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      if (contentRes.ok) {
        const cd = await contentRes.json();
        const content = cd.paste?.content || cd.content || "";
        console.log(`  Content snippet: ${content}`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
