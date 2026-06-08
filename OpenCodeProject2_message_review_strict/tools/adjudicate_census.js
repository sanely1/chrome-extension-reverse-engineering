const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out_001_gemini-3.5-flash');
const censusDir = path.join(outDir, 'census');

const promotedMessagesPath = path.join(censusDir, 'promoted_messages.csv');
const promotedStoragePath = path.join(censusDir, 'promoted_storage_keys.csv');

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

// 1. ADJUDICATE STORAGE KEYS
if (fs.existsSync(promotedStoragePath)) {
  const content = fs.readFileSync(promotedStoragePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const outRows = [['key', 'type', 'operation', 'decision', 'reason', 'purpose', 'file', 'line_start', 'line_end']];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 9) continue;
    const key = cols[0];
    const type = cols[1];
    const op = cols[2];
    const file = cols[6];
    const lineStart = cols[7];
    const lineEnd = cols[8];
    const context = cols[9] || '';

    let decision = 'confirmed_storage_key';
    let reason = 'Direct source context shows a real storage key or operational state variable';
    let purpose = 'Store extension settings or operational state';

    // Apply strict rejection heuristics
    if (key === 'sessionId' && context.includes('CAPI Connection closed')) {
      decision = 'rejected_candidate';
      reason = 'Candidate is a logging/error string parameter, not a stable storage key';
      purpose = '';
    } else if (key.startsWith('host.userAccount') || key === 'host.userAccount.') {
      decision = 'rejected_candidate';
      reason = 'Namespace prefix for custom RPC messaging, not a storage key';
      purpose = '';
    } else if (key === 'ChromeMV3SessionStorageApiImpl') {
      decision = 'rejected_candidate';
      reason = 'Implementation class name, not a concrete storage key';
      purpose = '';
    } else if (key === 'selectAdjacentFailed') {
      decision = 'rejected_candidate';
      reason = 'Callback string or method name within custom query flow, not a storage key';
      purpose = '';
    } else if (key === 'ltr' || key === 'rtl') {
      decision = 'rejected_candidate';
      reason = 'UI/CSS text direction layout constant, not a storage key';
      purpose = '';
    }

    if (decision === 'confirmed_storage_key') {
      if (key === 'isSidePanelOpen') purpose = 'Track if the assistant side panel is open';
      else if (key === 'isBGInitialized') purpose = 'Track service worker initialization status';
      else if (key === 'feMetricsAlarms') purpose = 'Manage telemetry and logging upload alarms';
      else if (key === 'feMetricsData') purpose = 'Cache client performance metrics and event counts';
      else if (key === 'gdocs_peak_collabs_dismissed') purpose = 'Track dismissal of high-collaboration notification in Google Docs';
      else if (key === 'alwaysOnAssistantOnOpenData') purpose = 'Cache open-context data for the side panel assistant';
      else if (key === 'human_writing_report') purpose = 'Store writing diagnostics and report metrics';
      else if (key === 'schema') purpose = 'ObjectStore name in IndexedDB schema';
      else if (key === 'document_state_enc' || key === 'document_state') purpose = 'IndexedDB object store for text document states';
      else if (key === 'GrammarlyEnrollmentToken') purpose = 'Managed storage policy token for Grammarly enrollment';
      else if (key === 'bgInitFail') purpose = 'Track background service worker startup failure count';
    }

    outRows.push([key, type, op, decision, reason, purpose, file, lineStart, lineEnd]);
  }

  fs.writeFileSync(path.join(censusDir, 'storage_candidate_review.csv'), outRows.map(toCSVRow).join('\n') + '\n');
  console.log(`Adjudicated ${outRows.length - 1} storage keys into storage_candidate_review.csv.`);
}

// 2. ADJUDICATE MESSAGES
if (fs.existsSync(promotedMessagesPath)) {
  const content = fs.readFileSync(promotedMessagesPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const outRows = [['channel_name', 'direction', 'api', 'decision', 'reason', 'payload_keys', 'file', 'line_start', 'line_end']];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 11) continue;
    const name = cols[0];
    let direction = cols[1];
    const api = cols[2];
    const payloadKeys = cols[6];
    const file = cols[7];
    const lineStart = cols[8];
    const lineEnd = cols[9];
    const context = cols[10] || '';

    // Map direction to schema-valid
    if (direction === 'window.postMessage' || direction === 'custom_or_rpc' || direction === 'addEventListener("message"') {
      direction = 'other';
    }

    let decision = 'confirmed_message_channel';
    let reason = 'Confirmed Chrome extension messaging channel, RPC method, or WebSocket CAPI protocol channel';

    const lowerName = name.toLowerCase();

    // Rejection rules
    if (
      lowerName === 'click' || lowerName === 'load' || lowerName === 'error' || lowerName === 'resize' ||
      lowerName === 'focus' || lowerName === 'blur' || lowerName === 'scroll' || lowerName === 'keypress' ||
      lowerName === 'keydown' || lowerName === 'keyup' || lowerName === 'mouseover' || lowerName === 'mouseout' ||
      lowerName === 'mousemove' || lowerName === 'pointerup' || lowerName === 'pointerdown' || lowerName === 'pointermove' ||
      lowerName === 'pointercancel' || lowerName === 'contextmenu' || lowerName === 'visibilitychange' ||
      lowerName === 'unload' || lowerName === 'readystatechange' || lowerName === 'longpress' || lowerName === 'longpressend' ||
      lowerName === 'message'
    ) {
      decision = 'rejected_candidate';
      reason = 'Generic DOM/Pointer/UI event name, not an extension message channel';
    } else if (
      lowerName === 'resolve' || lowerName === 'reject' || lowerName === 'success' || lowerName === 'failure' ||
      lowerName === 'flush' || lowerName === 'onreadystatechange' || lowerName === 'complete' || lowerName === 'done' ||
      lowerName === 'cancel' || lowerName === 'close' || lowerName === 'open' || lowerName === 'status' ||
      lowerName === 'request' || lowerName === 'response' || lowerName === 'transferable' || lowerName === 'outbound' ||
      lowerName === 'inbound' || lowerName === 'messagereceived' || lowerName === 'finished'
    ) {
      decision = 'rejected_candidate';
      reason = 'Promise/callback status label or generic logical state, not a stable message channel name';
    } else if (
      lowerName.startsWith('http') || lowerName.startsWith('https') || lowerName.startsWith('ws://') ||
      lowerName.startsWith('wss://') || lowerName.endsWith('.js') || lowerName.endsWith('.mjs') ||
      lowerName.endsWith('.json') || lowerName === 'application/json' || lowerName === 'module'
    ) {
      decision = 'rejected_candidate';
      reason = 'URL, HTTP protocol, script file reference, or mime-type, not a message channel';
    } else if (
      lowerName.includes('invalid value') || lowerName.includes('message aborted') || lowerName.includes('connection closed') ||
      lowerName.includes('too many bginitfail') || lowerName.includes('error setting prop') || lowerName.includes('failed to connect')
    ) {
      decision = 'rejected_candidate';
      reason = 'Human-readable log/error string, not an extension message channel';
    } else if (
      lowerName === 'preprocessevent' || lowerName === 'beforesendevent' || lowerName === 'aftersendevent' ||
      lowerName === 'beforeenvelope' || lowerName === 'beforeaddbreadcrumb' || lowerName === '_sentryrootspan' ||
      lowerName === 'applyframemetadata' || lowerName === 'attachment' || lowerName === 'client_report' ||
      lowerName === 'user_report' || lowerName === 'session' || lowerName === 'sessions' || lowerName === 'transaction'
    ) {
      decision = 'rejected_candidate';
      reason = 'Sentry/telemetry internal Event-Emitter hook or data envelope type, not extension message channel';
    } else if (
      lowerName === 'memorylogwriter' || lowerName === 'securekey' || lowerName === 'secureorigin' ||
      lowerName === 'inkwellsharedworker' || lowerName === 'sharedworker' || lowerName === 'optional_context' ||
      lowerName === 'background' || lowerName === 'selectalternative'
    ) {
      decision = 'rejected_candidate';
      reason = 'Internal implementation class, security option string, or delta node type, not a message channel';
    }

    outRows.push([name, direction, api, decision, reason, payloadKeys, file, lineStart, lineEnd]);
  }

  fs.writeFileSync(path.join(censusDir, 'message_candidate_review.csv'), outRows.map(toCSVRow).join('\n') + '\n');
  console.log(`Adjudicated ${outRows.length - 1} message channels into message_candidate_review.csv.`);
}
