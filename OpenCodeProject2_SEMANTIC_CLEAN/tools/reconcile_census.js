const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');
const censusDir = path.join(outDir, 'census');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function toCSVRow(arr) {
  return arr.map(val => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }).join(',');
}

// 1. Reconcile Endpoints (promoted_endpoints.csv -> endpoints.csv)
const endpointsSrc = path.join(censusDir, 'promoted_endpoints.csv');
if (fs.existsSync(endpointsSrc)) {
  const content = fs.readFileSync(endpointsSrc, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const outRows = [['url', 'method', 'file', 'line_start', 'line_end']];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 9) continue;
    const url = cols[0];
    let method = cols[2] || 'UNKNOWN';
    if (method === 'UNKNOWN' || method === '') {
      method = 'GET';
    }
    const file = cols[6];
    const lineStart = cols[7];
    const lineEnd = cols[8];
    outRows.push([url, method, file, lineStart, lineEnd]);
  }
  
  fs.writeFileSync(path.join(outDir, 'endpoints.csv'), outRows.map(toCSVRow).join('\n') + '\n');
  console.log(`Reconciled ${outRows.length - 1} endpoints.`);
}

// 2. Reconcile Messages (message_candidate_review.csv -> messages.csv, filtering for confirmed/likely)
const messagesSrc = path.join(censusDir, 'message_candidate_review.csv');
if (fs.existsSync(messagesSrc)) {
  const content = fs.readFileSync(messagesSrc, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const outRows = [['channel_name', 'direction', 'payload_keys', 'file', 'line_start', 'line_end']];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 9) continue;
    const channelName = cols[0];
    let direction = cols[1];
    const decision = cols[3];
    const payloadKeys = cols[5] || '';
    const file = cols[6];
    const lineStart = cols[7];
    const lineEnd = cols[8];

    if (decision === 'confirmed_message_channel' || decision === 'likely_message_channel') {
      // Map directions appropriately
      if (direction === 'window.postMessage' || direction === 'custom_or_rpc' || direction === 'addEventListener("message"') {
        direction = 'other';
      }
      outRows.push([channelName, direction, payloadKeys, file, lineStart, lineEnd]);
    }
  }
  
  fs.writeFileSync(path.join(outDir, 'messages.csv'), outRows.map(toCSVRow).join('\n') + '\n');
  console.log(`Reconciled ${outRows.length - 1} adjudicated messages.`);
}

// 3. Reconcile Storage (storage_candidate_review.csv -> storage_keys.csv, filtering for confirmed/likely)
const storageSrc = path.join(censusDir, 'storage_candidate_review.csv');
if (fs.existsSync(storageSrc)) {
  const content = fs.readFileSync(storageSrc, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const outRows = [['key', 'type', 'purpose', 'file', 'line_start', 'line_end']];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 9) continue;
    const key = cols[0];
    let type = cols[1].toLowerCase();
    const decision = cols[3];
    const purpose = cols[5];
    const file = cols[6];
    const lineStart = cols[7];
    const lineEnd = cols[8];

    if (decision === 'confirmed_storage_key' || decision === 'likely_storage_key') {
      if (type.includes('cookie')) {
        type = 'cookies';
      } else if (type.includes('indexeddb')) {
        type = 'indexeddb';
      } else if (type.includes('managed')) {
        type = 'managed';
      } else if (type.includes('sync')) {
        type = 'sync';
      } else {
        type = 'local';
      }
      outRows.push([key, type, purpose, file, lineStart, lineEnd]);
    }
  }
  
  fs.writeFileSync(path.join(outDir, 'storage_keys.csv'), outRows.map(toCSVRow).join('\n') + '\n');
  console.log(`Reconciled ${outRows.length - 1} adjudicated storage keys.`);
}
