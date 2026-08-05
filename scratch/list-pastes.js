const API_KEY = "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const PASTEFY_BASE = "https://pastefy.app/api/v2";

async function run() {
  try {
    const listRes = await fetch(`${PASTEFY_BASE}/paste?limit=200`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (!listRes.ok) {
      console.error("List failed:", listRes.status, await listRes.text());
      return;
    }
    const raw = await listRes.json();
    const items = Array.isArray(raw) ? raw : (raw.items || raw.data || []);
    console.log(`Total pastes found: ${items.length}`);
    
    for (const item of items) {
      const p = item.paste || item;
      console.log(`Paste: ID=${p.id}, Title="${p.title}", Created=${p.created_at}`);
      if (p.title === "syncauth-master") {
        // Fetch content snippet
        const contentRes = await fetch(`${PASTEFY_BASE}/paste/${p.id}`, {
          headers: { Authorization: `Bearer ${API_KEY}` }
        });
        if (contentRes.ok) {
          const cd = await contentRes.json();
          const content = cd.paste?.content || cd.content || "";
          console.log(`  Content length: ${content.length}`);
          console.log(`  Content snippet: ${content.slice(0, 300)}`);
        }
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
