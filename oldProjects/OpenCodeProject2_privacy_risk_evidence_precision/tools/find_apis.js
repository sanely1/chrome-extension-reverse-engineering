const fs = require('fs');
const path = require('path');

const root = process.cwd();
const extensionDir = path.resolve(root, './extension');
const outDir = path.resolve(root, './out_001_gemini-3.5-flash');

const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);
const SKIP_PARTS = new Set(['node_modules', '.git', 'coverage', 'dist', 'build', 'privacy_workspace']);

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(extensionDir, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (SKIP_PARTS.has(entry.name) || /^out_\d+/i.test(entry.name)) continue;
      walk(full, acc);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(ext)) continue;
      if (/beautified/i.test(entry.name)) continue;
      acc.push({ full, rel });
    }
  }
  return acc;
}

const jsFiles = walk(extensionDir);
const results = {};

for (const fileObj of jsFiles) {
  const code = fs.readFileSync(fileObj.full, 'utf8');
  const lines = code.split(/\r?\n/);
  const lineCount = lines.length;
  
  // Extract chrome.* and browser.* calls via regex
  const apis = new Set();
  const listeners = new Set();
  
  // Match things like chrome.storage.local.get or chrome.runtime.onMessage.addListener
  const chromeRegex = /\b(chrome|browser)\.[a-zA-Z0-9_.]+/g;
  let match;
  while ((match = chromeRegex.exec(code)) !== null) {
    let apiCall = match[0];
    // Clean trailing periods or parts
    apiCall = apiCall.replace(/\.$/, '');
    
    // Distinguish listeners and normal methods
    if (apiCall.endsWith('.addListener') || apiCall.endsWith('.removeListener')) {
      listeners.add(apiCall);
    } else {
      apis.add(apiCall);
    }
  }
  
  results[fileObj.rel] = {
    lineCount,
    apis: Array.from(apis).sort(),
    listeners: Array.from(listeners).sort()
  };
}

fs.writeFileSync(
  path.join(outDir, 'discovered_apis.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);

console.log('Dynamic API Forensic Extraction Complete! Output saved to out_001_gemini-3.5-flash/discovered_apis.json');
for (const [rel, data] of Object.entries(results)) {
  console.log(`- ${rel}: ${data.lineCount} lines, ${data.apis.length} unique APIs, ${data.listeners.length} unique listeners`);
}
