const API_KEY = "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const PASTEFY_BASE = "https://pastefy.app/api/v2";

async function run() {
  const masterRes = await fetch(`${PASTEFY_BASE}/paste/JwyIQPYF`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  const masterJson = await masterRes.json();
  const masterData = JSON.parse(masterJson.paste?.content || masterJson.content || "{}");
  console.log("Projects in Master DB:");
  for (const [id, p] of Object.entries(masterData.projects)) {
    console.log(`- Project ID: ${id}, Name: ${p.name}, Paste ID: ${p.paste_id}`);
    
    // Load project data
    const projRes = await fetch(`${PASTEFY_BASE}/paste/${p.paste_id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const projJson = await projRes.json();
    const projData = JSON.parse(projJson.paste?.content || projJson.content || "{}");
    
    console.log("  Scripts in Project:");
    for (const [sid, script] of Object.entries(projData.scripts || {})) {
      console.log(`    * Script ID: ${sid}, Name: ${script.name}`);
      const codeLines = script.script_code.split("\n");
      console.log(`      Length: ${codeLines.length} lines`);
      if (codeLines.length >= 370) {
        console.log(`      Line 371: ${codeLines[370]}`);
      }
    }
  }
}

run().catch(console.error);
