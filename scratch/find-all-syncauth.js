const API_KEY = "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const PASTEFY_BASE = "https://pastefy.app/api/v2";

async function run() {
  try {
    for (let page = 1; page <= 8; page++) {
      console.log(`Fetching page ${page}...`);
      const listRes = await fetch(`${PASTEFY_BASE}/paste?limit=100&page=${page}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      const text = await listRes.text();
      // Since it has invalid JSON characters, we can extract the title and id using regex!
      const regex = /"id"\s*:\s*"([^"]+)"\s*,\s*"title"\s*:\s*"([^"]+)"/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const id = match[1];
        const title = match[2];
        if (title.includes("syncauth")) {
          console.log(`Found SyncAuth paste: ID=${id}, Title=${title}`);
          // Let's fetch details
          const contentRes = await fetch(`${PASTEFY_BASE}/paste/${id}`, {
            headers: { Authorization: `Bearer ${API_KEY}` }
          });
          if (contentRes.ok) {
            const cd = await contentRes.json();
            const content = cd.paste?.content || cd.content || "";
            console.log(`  Content length: ${content.length}`);
            console.log(`  Content: ${content.slice(0, 200)}...`);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
