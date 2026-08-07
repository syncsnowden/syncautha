const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('route.ts') || fullPath.endsWith('page.tsx') || fullPath.endsWith('layout.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('export const runtime = "edge"') && !content.includes("export const runtime = 'edge'")) {
        // Find a good place to insert it (after imports)
        const lines = content.split('\n');
        let insertIdx = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            insertIdx = i + 1;
          }
        }
        lines.splice(insertIdx, 0, 'export const runtime = "edge";');
        fs.writeFileSync(fullPath, lines.join('\n'));
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, '../src/app'));
