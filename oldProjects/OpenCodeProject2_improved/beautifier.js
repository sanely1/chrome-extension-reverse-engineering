const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify').js;

const extensionDir = path.join(__dirname, 'extension');
const outDir = path.join(__dirname, 'out_001_gemini-3.5-flash');
const beautifyMapFile = path.join(outDir, 'beautify_map.json');

const EXCLUDE_DIRS = ['node_modules', 'vendor', 'build', 'dist', 'coverage', '_metadata'];

function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        getAllJsFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if ((ext === '.js' || ext === '.mjs') && !file.includes('.beautified.')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

console.log('Scanning for JS files...');
const jsFiles = getAllJsFiles(extensionDir);
console.log(`Found ${jsFiles.length} original JS/MJS files.`);

const map = [];

jsFiles.forEach((file, index) => {
  const relPath = path.relative(extensionDir, file);
  const beautifiedPath = file.replace(/\.js$/, '.beautified.js').replace(/\.mjs$/, '.beautified.mjs');
  const relBeautifiedPath = path.relative(extensionDir, beautifiedPath);
  
  try {
    const originalContent = fs.readFileSync(file, 'utf8');
    const beautifiedContent = beautify(originalContent, {
      indent_size: 2,
      space_in_empty_paren: false,
      max_preserve_newlines: 2
    });
    
    fs.writeFileSync(beautifiedPath, beautifiedContent, 'utf8');
    map.push({
      original: relPath.replace(/\\/g, '/'),
      beautified: relBeautifiedPath.replace(/\\/g, '/'),
      status: 'ok'
    });
    console.log(`[${index + 1}/${jsFiles.length}] Beautified: ${relPath}`);
  } catch (err) {
    console.error(`Failed to beautify ${relPath}:`, err.message);
    map.push({
      original: relPath.replace(/\\/g, '/'),
      beautified: '',
      status: `error: ${err.message}`
    });
  }
});

fs.writeFileSync(beautifyMapFile, JSON.stringify(map, null, 2), 'utf8');
console.log(`Beautification complete! Mapping written to ${beautifyMapFile}`);
