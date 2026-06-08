const fs = require('fs');
const path = require('path');

const bgPath = path.join(__dirname, 'extension/src/js/Grammarly-bg.beautified.js');
if (fs.existsSync(bgPath)) {
  const content = fs.readFileSync(bgPath, 'utf8');
  const lines = content.split('\n');
  console.log('Searching onMessage listeners in Grammarly-bg.beautified.js...');

  lines.forEach((line, index) => {
    if (line.includes('onMessage.addListener') || line.includes('runtime.onMessage')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
      // Print surrounding lines
      for (let i = Math.max(0, index - 2); i < Math.min(lines.length, index + 15); i++) {
        console.log(`  [${i + 1}] ${lines[i]}`);
      }
    }
  });
} else {
  console.log('Background script not found.');
}
