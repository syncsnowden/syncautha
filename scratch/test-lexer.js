const API_KEY = "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const PASTEFY_BASE = "https://pastefy.app/api/v2";

async function run() {
  try {
    const allMasters = [];
    for (let page = 1; page <= 10; page++) {
      console.log(`Scanning page ${page}...`);
      const listRes = await fetch(`${PASTEFY_BASE}/paste?limit=100&page=${page}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      if (!listRes.ok) break;
      const text = await listRes.text();
      
      // Let's find all occurrences of "syncauth-master" or "syncauth-db"
      let idx = 0;
      while (true) {
        // Find next title
        const nextMaster = text.indexOf('"title":"syncauth-master"', idx);
        const nextDb = text.indexOf('"title":"syncauth-db"', idx);
        
        let foundIdx = -1;
        let titleFound = "";
        if (nextMaster !== -1 && (nextDb === -1 || nextMaster < nextDb)) {
          foundIdx = nextMaster;
          titleFound = "syncauth-master";
        } else if (nextDb !== -1) {
          foundIdx = nextDb;
          titleFound = "syncauth-db";
        }
        
        if (foundIdx === -1) break;
        
        // Look backwards from foundIdx for the first `"id":"`
        const idPrefix = '"id":"';
        const idIdx = text.lastIndexOf(idPrefix, foundIdx);
        if (idIdx !== -1) {
          const idStart = idIdx + idPrefix.length;
          const idEnd = text.indexOf('"', idStart);
          if (idEnd !== -1) {
            const id = text.substring(idStart, idEnd);
            allMasters.push({ id, title: titleFound });
          }
        }
        idx = foundIdx + titleFound.length + 10;
      }
    }
    
    console.log(`Found ${allMasters.length} matching paste references:`);
    for (const m of allMasters) {
      const res = await fetch(`${PASTEFY_BASE}/paste/${m.id}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.paste?.content || data.content || "";
        console.log(`ID: ${m.id}, Title: ${m.title}, Content Length: ${content.length}`);
        console.log(`Content snippet: ${content.slice(0, 400)}`);
      } else {
        console.log(`ID: ${m.id} (failed to fetch details)`);
      }
    }
  } catch (err) {
    console.error("Error in scanner:", err);
  }
}

run();
