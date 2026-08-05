const API_KEY = "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const PASTEFY_BASE = "https://pastefy.app/api/v2";

async function run() {
  const pasteId = "zLoFvHkr";
  try {
    const contentRes = await fetch(`${PASTEFY_BASE}/paste/${pasteId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (contentRes.ok) {
      const cd = await contentRes.json();
      const content = cd.paste?.content || cd.content || "{}";
      const data = JSON.parse(content);
      console.log("Settings:", JSON.stringify(data.settings, null, 2));
      console.log("Scripts count:", Object.keys(data.scripts || {}).length);
      console.log("Keys count:", Object.keys(data.keys || {}).length);
      console.log("Rewards count:", Object.keys(data.rewards || {}).length);
    } else {
      console.error("Failed to read project:", contentRes.status, await contentRes.text());
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
