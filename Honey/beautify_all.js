const fs = require('fs');
const path = require('path');

// Locate js-beautify inside extension/node_modules/js-beautify
const beautifyPath = path.join(__dirname, 'extension', 'node_modules', 'js-beautify');
let js_beautify;
try {
  js_beautify = require(beautifyPath).js;
} catch (e) {
  console.error("Failed to load js-beautify from extension's node_modules, trying global/standard require:", e.message);
  try {
    js_beautify = require('js-beautify').js;
  } catch (err) {
    console.error("Could not load js-beautify. Please install dependencies.");
    process.exit(1);
  }
}

const OUT_DIR = path.join(__dirname, 'out_001_gemini_3.5_flash');
const extensionDir = path.join(__dirname, 'extension');

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'vendor' || file === 'build' || file === 'dist' || file === 'coverage' || file === '.git' || file === '.github') {
        continue;
      }
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  }
}

const map = [];

console.log("Starting beautification scan...");

walkDir(extensionDir, (filePath) => {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath);
  
  if ((ext === '.js' || ext === '.mjs') && !baseName.includes('beautified')) {
    const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
    const beautifiedPath = filePath.slice(0, -ext.length) + '.beautified' + ext;
    const relativeBeautifiedPath = path.relative(__dirname, beautifiedPath).replace(/\\/g, '/');
    
    try {
      console.log(`Beautifying: ${relativePath}`);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const beautifiedContent = js_beautify(content, {
        indent_size: 2,
        space_in_empty_paren: true,
        max_preserve_newlines: 2
      });
      
      fs.writeFileSync(beautifiedPath, beautifiedContent, 'utf8');
      
      map.push({
        original: relativePath,
        beautified: relativeBeautifiedPath,
        status: "ok"
      });
    } catch (err) {
      console.error(`Error beautifying ${relativePath}:`, err.message);
      map.push({
        original: relativePath,
        beautified: relativeBeautifiedPath,
        status: "error: " + err.message
      });
    }
  }
});

fs.writeFileSync(path.join(OUT_DIR, 'beautify_map.json'), JSON.stringify(map, null, 2), 'utf8');
console.log(`Beautification complete! Wrote beautify_map.json containing ${map.length} mappings.`);
