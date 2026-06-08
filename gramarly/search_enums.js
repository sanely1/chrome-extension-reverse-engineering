const fs = require('fs');
const path = require('path');

const bgPath = path.join(__dirname, 'extension/src/js/Grammarly-bg.beautified.js');
if (fs.existsSync(bgPath)) {
  const content = fs.readFileSync(bgPath, 'utf8');
  const lines = content.split('\n');

  console.log('Searching capitalization patterns of message enums...');
  lines.forEach((line, index) => {
    if (line.includes('OpenSubscriptionDialog') || line.includes('SetUserInfo')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
      for (let i = Math.max(0, index - 5); i < Math.min(lines.length, index + 10); i++) {
        console.log(`  [${i + 1}] ${lines[i]}`);
      }
    }
  });
}
