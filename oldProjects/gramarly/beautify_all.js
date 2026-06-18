const fs = require('fs');
const path = require('path');
const jsBeautify = require('./extension/node_modules/js-beautify').js;

const OUT_DIR = path.join(__dirname, 'out_001_gemini_3_5_flash');
const EXT_DIR = path.join(__dirname, 'extension');
const beautifyMapPath = path.join(OUT_DIR, 'beautify_map.json');

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'vendor' && file !== 'build' && file !== 'dist' && file !== 'coverage') {
        walkDir(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if ((ext === '.js' || ext === '.mjs') && !file.includes('beautified')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function main() {
  const allFiles = walkDir(EXT_DIR);
  console.log(`Found ${allFiles.length} JavaScript files to beautify.`);

  const map = [];
  let successCount = 0;
  let errorCount = 0;

  for (const file of allFiles) {
    const relativePath = path.relative(__dirname, file).replace(/\\/g, '/');
    const dir = path.dirname(file);
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    const beautifiedFile = path.join(dir, `${base}.beautified${ext}`);
    const relativeBeautified = path.relative(__dirname, beautifiedFile).replace(/\\/g, '/');

    try {
      const content = fs.readFileSync(file, 'utf8');
      const beautifiedContent = jsBeautify(content, {
        indent_size: 2,
        space_in_empty_paren: true,
        max_preserve_newlines: 2
      });
      fs.writeFileSync(beautifiedFile, beautifiedContent, 'utf8');
      map.push({ original: relativePath, beautified: relativeBeautified, status: 'ok' });
      successCount++;
    } catch (e) {
      console.error(`Failed to beautify ${relativePath}:`, e);
      map.push({ original: relativePath, beautified: null, status: `error: ${e.message}` });
      errorCount++;
    }
  }

  fs.writeFileSync(beautifyMapPath, JSON.stringify(map, null, 2), 'utf8');
  console.log(`Beautification complete. Success: ${successCount}, Errors: ${errorCount}`);
  
  // Also update scan_log.txt with beautification status
  const scanLogPath = path.join(OUT_DIR, 'scan_log.txt');
  let logContent = fs.readFileSync(scanLogPath, 'utf8');
  logContent = logContent.replace('Beautification status: pending', `Beautification status: ok, success: ${successCount}, errors: ${errorCount}`);
  fs.writeFileSync(scanLogPath, logContent, 'utf8');
}

main().catch(err => {
  console.error('Beautification script failed:', err);
});
