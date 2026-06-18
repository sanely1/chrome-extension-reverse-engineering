const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'out_001_gemini_3_5_flash');

function deduplicateCsv(filePath, keyColumnIndex) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  if (lines.length <= 1) return;

  const header = lines[0];
  const dataLines = lines.slice(1);

  const seen = new Set();
  const uniqueLines = [];

  for (const line of dataLines) {
    // Basic CSV cell parsing (simple split by comma for key field, as key is usually first column and contains no commas)
    const cells = [];
    let currentCell = '';
    let insideQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        cells.push(currentCell);
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell);

    const keyVal = cells[keyColumnIndex] || '';
    if (!seen.has(keyVal)) {
      seen.add(keyVal);
      uniqueLines.push(line);
    }
  }

  fs.writeFileSync(filePath, [header, ...uniqueLines].join('\n') + '\n', 'utf8');
  console.log(`Deduplicated ${path.basename(filePath)}: ${dataLines.length} -> ${uniqueLines.length} rows.`);
}

function main() {
  deduplicateCsv(path.join(OUT_DIR, 'endpoints.csv'), 0);
  deduplicateCsv(path.join(OUT_DIR, 'messages.csv'), 0);
  deduplicateCsv(path.join(OUT_DIR, 'storage_keys.csv'), 0);
}

main();
