const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out_001_gemini-3.5-flash');
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

// 1. Reconcile Endpoints
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
    if (method === 'UNKNOWN') {
      method = 'GET'; // fallback or keep as is
    }
    const file = cols[6];
    const lineStart = cols[7];
    const lineEnd = cols[8];
    outRows.push([url, method, file, lineStart, lineEnd]);
  }
  
  fs.writeFileSync(path.join(outDir, 'endpoints.csv'), outRows.map(toCSVRow).join('\n') + '\n');
  console.log(`Reconciled ${outRows.length - 1} endpoints.`);
}

// 2. Reconcile Messages
const messagesSrc = path.join(censusDir, 'promoted_messages.csv');
if (fs.existsSync(messagesSrc)) {
  const content = fs.readFileSync(messagesSrc, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const outRows = [['channel_name', 'direction', 'payload_keys', 'file', 'line_start', 'line_end']];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 10) continue;
    const channelName = cols[0];
    let direction = cols[1];
    // Map direction to schema valid values: content->background, background->content, ui->background, other
    if (direction === 'window.postMessage' || direction === 'custom_or_rpc') {
      direction = 'other';
    } else if (direction === 'addEventListener("message"') {
      direction = 'other';
    }
    const payloadKeys = cols[6] || '';
    const file = cols[7];
    const lineStart = cols[8];
    const lineEnd = cols[9];
    outRows.push([channelName, direction, payloadKeys, file, lineStart, lineEnd]);
  }
  
  fs.writeFileSync(path.join(outDir, 'messages.csv'), outRows.map(toCSVRow).join('\n') + '\n');
  console.log(`Reconciled ${outRows.length - 1} messages.`);
}

// 3. Reconcile Storage
const storageSrc = path.join(censusDir, 'promoted_storage_keys.csv');
if (fs.existsSync(storageSrc)) {
  const content = fs.readFileSync(storageSrc, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const outRows = [['key', 'type', 'purpose', 'file', 'line_start', 'line_end']];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 9) continue;
    const key = cols[0];
    let type = cols[1];
    // Map type to schema: local, sync, managed, indexeddb, cookies
    if (type === 'custom_wrapper_or_cache') {
      type = 'local';
    } else if (type === 'sessionStorage' || type === 'localStorage') {
      type = 'local';
    } else if (type === 'cookies') {
      type = 'cookies';
    } else if (type === 'indexedDB') {
      type = 'indexeddb';
    }
    
    // Inferred purpose
    let purpose = 'Store extension settings or operational state';
    if (key === 'isSidePanelOpen') purpose = 'Track if the assistant side panel is open';
    if (key === 'isBGInitialized') purpose = 'Track service worker initialization status';
    if (key === 'feMetricsAlarms') purpose = 'Manage telemetry and logging upload alarms';
    if (key === 'feMetricsData') purpose = 'Cache client performance metrics and event counts';
    if (key === 'gdocs_peak_collabs_dismissed') purpose = 'Track dismissal of high-collaboration notification in Google Docs';
    if (key === 'alwaysOnAssistantOnOpenData') purpose = 'Cache open-context data for the side panel assistant';
    if (key === 'human_writing_report') purpose = 'Store writing diagnostics and report metrics';
    if (key === 'cookie') purpose = 'Check authentication or user sessions';
    
    const file = cols[6];
    const lineStart = cols[7];
    const lineEnd = cols[8];
    outRows.push([key, type, purpose, file, lineStart, lineEnd]);
  }
  
  fs.writeFileSync(path.join(outDir, 'storage_keys.csv'), outRows.map(toCSVRow).join('\n') + '\n');
  console.log(`Reconciled ${outRows.length - 1} storage keys.`);
}
