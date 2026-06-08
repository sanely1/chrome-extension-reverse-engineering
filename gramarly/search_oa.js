const fs = require('fs');
const path = require('path');

const bgPath = path.join(__dirname, 'extension/src/js/Grammarly-bg.beautified.js');
if (fs.existsSync(bgPath)) {
  const content = fs.readFileSync(bgPath, 'utf8');
  const lines = content.split('\n');

  console.log('Searching class oa or function oa or message dispatching...');
  lines.forEach((line, index) => {
    if (line.match(/^\s*class\s+oa\b/) || line.match(/^\s*function\s+oa\b/) || line.includes('oa = class')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
      for (let i = Math.max(0, index - 2); i < Math.min(lines.length, index + 30); i++) {
        console.log(`  [${i + 1}] ${lines[i]}`);
      }
    }
  });
}
