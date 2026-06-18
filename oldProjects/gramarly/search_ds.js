const fs = require('fs');
const path = require('path');

const bgPath = path.join(__dirname, 'extension/src/js/Grammarly-bg.beautified.js');
if (fs.existsSync(bgPath)) {
  const content = fs.readFileSync(bgPath, 'utf8');
  const lines = content.split('\n');

  console.log('Searching Ds definition...');
  lines.forEach((line, index) => {
    if (line.includes('Ds =') || line.match(/^\s*const\s+Ds\s*=/)) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
      for (let i = Math.max(0, index - 2); i < Math.min(lines.length, index + 20); i++) {
        console.log(`  [${i + 1}] ${lines[i]}`);
      }
    }
  });
}
