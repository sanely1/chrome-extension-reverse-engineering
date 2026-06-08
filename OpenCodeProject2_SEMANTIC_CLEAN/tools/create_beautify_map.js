const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

const OUT_DIR = process.argv[2] || './out_001_gemini-3.5-flash';
const EXT_DIR = process.argv[3] || './extension';

async function main() {
  console.log(`Scanning original JS files in ${EXT_DIR}...`);
  
  // Find all js and mjs files in EXT_DIR, excluding node_modules, vendor, etc.
  const files = glob.sync('**/*.{js,mjs}', {
    cwd: EXT_DIR,
    ignore: [
      '**/node_modules/**',
      '**/vendor/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/*.beautified.js',
      '**/*.beautified.mjs'
    ],
    absolute: false
  });

  const beautifyMap = [];

  for (const relPath of files) {
    const originalPath = path.join(EXT_DIR, relPath);
    const ext = path.extname(relPath);
    const relBeautifiedPath = relPath.slice(0, -ext.length) + '.beautified' + ext;
    const beautifiedPath = path.join(EXT_DIR, relBeautifiedPath);

    let status = 'ok';
    if (fs.existsSync(beautifiedPath)) {
      status = 'ok';
      console.log(`Found existing beautified file: ${relBeautifiedPath}`);
    } else {
      console.log(`Beautified file does not exist for: ${relPath}. Attempting to beautify...`);
      try {
        // Run js-beautify
        execSync(`npx js-beautify "${originalPath}" -o "${beautifiedPath}"`);
        status = 'ok';
        console.log(`Successfully beautified: ${relPath} -> ${relBeautifiedPath}`);
      } catch (err) {
        status = `error: ${err.message}`;
        console.error(`Failed to beautify ${relPath}:`, err.message);
      }
    }

    // Convert paths to workspace-relative or clean paths
    // The workspace path should be "extension/..."
    const cleanOriginal = path.normalize(path.join('extension', relPath)).replace(/\\/g, '/');
    const cleanBeautified = path.normalize(path.join('extension', relBeautifiedPath)).replace(/\\/g, '/');

    beautifyMap.push({
      original: cleanOriginal,
      beautified: cleanBeautified,
      status: status
    });
  }

  const mapDest = path.join(OUT_DIR, 'beautify_map.json');
  fs.writeFileSync(mapDest, JSON.stringify(beautifyMap, null, 2));
  console.log(`Wrote beautify map with ${beautifyMap.length} entries to ${mapDest}`);
}

main().catch(console.error);
