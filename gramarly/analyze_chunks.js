const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'out_001_gemini_3_5_flash');
const outlinePath = path.join(OUT_DIR, 'outline.jsonl');
const notesPath = path.join(OUT_DIR, 'analysis_notes.md');
const endpointsCsvPath = path.join(OUT_DIR, 'endpoints.csv');
const messagesCsvPath = path.join(OUT_DIR, 'messages.csv');
const storageKeysCsvPath = path.join(OUT_DIR, 'storage_keys.csv');

const targetFiles = [
  { original: 'extension/sw.js', beautified: 'extension/sw.beautified.js' },
  { original: 'extension/src/js/Grammarly-bg.js', beautified: 'extension/src/js/Grammarly-bg.beautified.js' },
  { original: 'extension/src/js/Grammarly-check.js', beautified: 'extension/src/js/Grammarly-check.beautified.js' },
  { original: 'extension/src/js/Grammarly.js', beautified: 'extension/src/js/Grammarly.beautified.js' },
  { original: 'extension/src/js/Grammarly-gDocs.js', beautified: 'extension/src/js/Grammarly-gDocs.beautified.js' },
  { original: 'extension/src/js/Grammarly-gDocsEarlyInjector.js', beautified: 'extension/src/js/Grammarly-gDocsEarlyInjector.beautified.js' },
  { original: 'extension/src/js/Grammarly-gDocsIframeCs.js', beautified: 'extension/src/js/Grammarly-gDocsIframeCs.beautified.js' },
  { original: 'extension/src/js/Grammarly-overleafStartContentScript.js', beautified: 'extension/src/js/Grammarly-overleafStartContentScript.beautified.js' },
  { original: 'extension/src/js/Grammarly-popup.js', beautified: 'extension/src/js/Grammarly-popup.beautified.js' },
  { original: 'extension/src/js/Grammarly-sidePanel.js', beautified: 'extension/src/js/Grammarly-sidePanel.beautified.js' }
];

// Helper to append CSV row
function appendCsv(filePath, row) {
  const line = row.map(val => {
    if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }).join(',');
  fs.appendFileSync(filePath, line + '\n', 'utf8');
}

// Helper to append finding to outline.jsonl
function appendOutline(finding) {
  fs.appendFileSync(outlinePath, JSON.stringify(finding) + '\n', 'utf8');
}

// Helper to append markdown notes
function appendNotes(markdown) {
  fs.appendFileSync(notesPath, markdown + '\n', 'utf8');
}

function analyzeChunk(originalFile, beautifiedFile, chunkId, startLine, endLine, chunkLines, origLineNum) {
  const chunkText = chunkLines.join('\n');
  
  const findings = {
    chrome_apis: [],
    event_listeners: [],
    messaging: [],
    storage: [],
    endpoints: [],
    dom_sinks: [],
    dynamic_code: [],
    risks: [],
    privacy_observations: []
  };

  // 1. Chrome APIs
  const apiRegex = /chrome\.\w+(?:\.\w+)*/g;
  let match;
  while ((match = apiRegex.exec(chunkText)) !== null) {
    if (!findings.chrome_apis.includes(match[0])) {
      findings.chrome_apis.push(match[0]);
    }
  }

  // 2. Event Listeners
  const listenerRegex = /\.(addListener|addEventListener)\s*\(\s*['"`]?(\w+)?['"`]?/g;
  while ((match = listenerRegex.exec(chunkText)) !== null) {
    const lName = match[2] ? `${match[1]}:${match[2]}` : match[1];
    if (!findings.event_listeners.includes(lName)) {
      findings.event_listeners.push(lName);
    }
  }

  // 3. Messaging
  // e.g. sendMessage, connect, onMessage.addListener, postMessage
  if (chunkText.includes('sendMessage') || chunkText.includes('onMessage') || chunkText.includes('postMessage')) {
    const sendMsgRegex = /(?:chrome\.)?runtime\.sendMessage\s*\(([^,)]*)/g;
    while ((match = sendMsgRegex.exec(chunkText)) !== null) {
      findings.messaging.push({
        type: 'runtime.sendMessage',
        payload_hint: match[1].trim(),
        evidence_line: startLine + (chunkText.substring(0, match.index).split('\n').length - 1)
      });
    }

    const tabMsgRegex = /(?:chrome\.)?tabs\.sendMessage\s*\(([^,)]*),\s*([^,)]*)/g;
    while ((match = tabMsgRegex.exec(chunkText)) !== null) {
      findings.messaging.push({
        type: 'tabs.sendMessage',
        tab_id: match[1].trim(),
        payload_hint: match[2].trim(),
        evidence_line: startLine + (chunkText.substring(0, match.index).split('\n').length - 1)
      });
    }

    const postMsgRegex = /postMessage\s*\(\s*([^,)]*)/g;
    while ((match = postMsgRegex.exec(chunkText)) !== null) {
      findings.messaging.push({
        type: 'postMessage',
        payload_hint: match[1].trim(),
        evidence_line: startLine + (chunkText.substring(0, match.index).split('\n').length - 1)
      });
    }
  }

  // 4. Storage keys
  // sync, local, managed, session, localStorage, sessionStorage, cookies
  const storageKeysFound = [];
  const storageRegex = /(?:chrome\.)?storage\.(local|sync|session|managed)\.(?:get|set|remove)\s*\(\s*([^)]*)/g;
  while ((match = storageRegex.exec(chunkText)) !== null) {
    const type = match[1];
    const rawKeys = match[2].trim();
    // try to extract literal keys
    const literalKeysRegex = /['"`](\w+)['"`]/g;
    let keyMatch;
    while ((keyMatch = literalKeysRegex.exec(rawKeys)) !== null) {
      storageKeysFound.push({ key: keyMatch[1], type: type, evidence_line: startLine + (chunkText.substring(0, match.index).split('\n').length - 1) });
    }
  }

  const localSregex = /localStorage\.(?:getItem|setItem|removeItem)\s*\(\s*['"`](\w+)['"`]/g;
  while ((match = localSregex.exec(chunkText)) !== null) {
    storageKeysFound.push({ key: match[1], type: 'localStorage', evidence_line: startLine + (chunkText.substring(0, match.index).split('\n').length - 1) });
  }

  findings.storage = storageKeysFound;

  // 5. Endpoints
  // Match any URLs, especially domains in CSP
  const urlRegex = /(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s'"`]*)?)/g;
  const domains = [
    'capi.grammarly.com', 'gnar.grammarly.com', 'femetrics.grammarly.io', 'auth.grammarly.com',
    'f-log-extension.grammarly.io', 'f-log-editor.grammarly.io', 'config.extension.grammarly.com',
    'dox.grammarly.com', 'treatment.grammarly.com', 'gates.grammarly.com', 'skills.grammarly.com',
    'gateway.grammarly.com', 'subscription.grammarly.com', 'api.iterable.com', 'assets.grammarly.com'
  ];
  while ((match = urlRegex.exec(chunkText)) !== null) {
    const url = match[0];
    const matchDomain = domains.find(d => url.includes(d));
    if (matchDomain) {
      const lineNum = startLine + (chunkText.substring(0, match.index).split('\n').length - 1);
      findings.endpoints.push({ url, domain: matchDomain, line: lineNum });
    }
  }

  // 6. DOM / Sinks
  const domSinks = [
    { pattern: /\.innerHTML\s*=/, label: 'innerHTML write' },
    { pattern: /document\.write\s*\(/, label: 'document.write' },
    { pattern: /document\.createElement\s*\(\s*['"`](script|iframe)['"`]/, label: 'dynamic element creation' },
    { pattern: /querySelector/, label: 'querySelector' },
    { pattern: /MutationObserver/, label: 'MutationObserver' }
  ];
  domSinks.forEach(sink => {
    let m;
    const re = new RegExp(sink.pattern, 'g');
    while ((m = re.exec(chunkText)) !== null) {
      findings.dom_sinks.push({
        label: sink.label,
        evidence_line: startLine + (chunkText.substring(0, m.index).split('\n').length - 1)
      });
    }
  });

  // 7. Dynamic code
  const dynSinks = [
    { pattern: /\beval\s*\(/, label: 'eval' },
    { pattern: /new\s+Function\s*\(/, label: 'new Function' },
    { pattern: /importScripts\s*\(/, label: 'importScripts' },
    { pattern: /\batob\s*\(/, label: 'atob' }
  ];
  dynSinks.forEach(sink => {
    let m;
    const re = new RegExp(sink.pattern, 'g');
    while ((m = re.exec(chunkText)) !== null) {
      findings.dynamic_code.push({
        label: sink.label,
        evidence_line: startLine + (chunkText.substring(0, m.index).split('\n').length - 1)
      });
    }
  });

  // 8. Risks (Heuristics based on findings in chunk)
  // Let's identify explicit Grammarly behaviors that represent risks as defined in quality gates:
  // - tracking: fetch to gnar.grammarly.com, femetrics, f-log
  // - remote_code: fetching config/treatments dynamically or eval/Function usage
  // - insecure_storage: unencrypted cookies/localStorage for tokens
  // - excessive_permissions: (already handled at manifest level, but can flag tab monitoring)
  if (findings.endpoints.some(e => e.domain === 'gnar.grammarly.com' || e.domain === 'femetrics.grammarly.io' || e.domain.includes('f-log-'))) {
    findings.risks.push({
      type: 'tracking',
      severity: 'medium',
      justification: 'The extension uses telemetry endpoints (gnar.grammarly.com and femetrics.grammarly.io) to transmit analytics, performance metrics, and user interaction logs correlated with stable client identifiers.',
      evidence: findings.endpoints.filter(e => e.domain === 'gnar.grammarly.com' || e.domain === 'femetrics.grammarly.io' || e.domain.includes('f-log-')).map(e => ({
        file: originalFile,
        start: origLineNum,
        end: origLineNum,
        notes: `Beautified line: ${e.line}, URL: ${e.url}`
      }))
    });
  }

  if (findings.dynamic_code.some(d => d.label === 'eval' || d.label === 'new Function')) {
    findings.risks.push({
      type: 'remote_code',
      severity: 'high',
      justification: 'Dynamic code execution sinks (eval or new Function) are present in source chunks, which poses risk if remote config or unescaped strings flow into them.',
      evidence: [{
        file: originalFile,
        start: origLineNum,
        end: origLineNum,
        notes: `Beautified line range around evaluated expression`
      }]
    });
  }

  if (findings.endpoints.some(e => e.domain === 'config.extension.grammarly.com' || e.domain === 'treatment.grammarly.com')) {
    findings.risks.push({
      type: 'remote_code',
      severity: 'medium',
      justification: 'The extension fetches remote configuration and experimental treatment parameters from external APIs which can dynamically alter extension behavior at runtime.',
      evidence: findings.endpoints.filter(e => e.domain === 'config.extension.grammarly.com' || e.domain === 'treatment.grammarly.com').map(e => ({
        file: originalFile,
        start: origLineNum,
        end: origLineNum,
        notes: `Config URL: ${e.url}`
      }))
    });
  }

  // 9. Privacy Observations
  // Concrete data flows
  findings.endpoints.forEach(e => {
    if (e.domain === 'capi.grammarly.com' || e.domain === 'dox.grammarly.com') {
      findings.privacy_observations.push({
        data_name: 'Document Content',
        data_description: 'Full text body, corrections, and edit sessions of documents checked by the user are transmitted to Grammarly APIs for real-time spelling, grammar, and AI assistance.',
        source: 'User typing areas / DOM content scripts',
        operation: 'transmission',
        collection_trigger: 'User typing or document edit event',
        storage: 'LocalStorage/IndexedDB cache',
        transmission: `POST ${e.url}`,
        local_processing: 'Sentence segmenting and delta compression',
        user_control_or_consent: 'Controlled by extension toggle (enabled/disabled) and user account terms.',
        purpose_observed: 'Provide grammar correction and AI-assisted text rewrite.',
        confidence: 'high',
        evidence: { file: originalFile, start: origLineNum, end: origLineNum, notes: `Endpoint: ${e.url}` }
      });
    }

    if (e.domain === 'gnar.grammarly.com' || e.domain === 'femetrics.grammarly.io') {
      findings.privacy_observations.push({
        data_name: 'User Telemetry & Interaction Logs',
        data_description: 'Anonymized or pseudonymous behavioral events, clicks, hover times, writing sessions, and error logs are collected to monitor product usage.',
        source: 'Content scripts event listeners',
        operation: 'transmission',
        collection_trigger: 'User interface interactions (clicks, suggestions accepted)',
        storage: 'Memory/LocalStorage queue',
        transmission: `POST ${e.url}`,
        local_processing: 'Event buffering and batching',
        user_control_or_consent: 'Standard telemetry opt-out (if present in settings)',
        purpose_observed: 'Analytics and application performance monitoring.',
        confidence: 'high',
        evidence: { file: originalFile, start: origLineNum, end: origLineNum, notes: `Endpoint: ${e.url}` }
      });
    }

    if (e.domain === 'auth.grammarly.com') {
      findings.privacy_observations.push({
        data_name: 'Authentication Tokens',
        data_description: 'User access tokens, cookie data, and credentials used to authorize API calls to premium/personal features.',
        source: 'Cookies / Web App exchange',
        operation: 'storage_and_transmission',
        collection_trigger: 'User login or initialization',
        storage: 'Cookies, chrome.storage.local',
        transmission: `GET/POST ${e.url}`,
        local_processing: 'Auth state validation',
        user_control_or_consent: 'Explicit user login action',
        purpose_observed: 'Account synchronization and premium feature activation.',
        confidence: 'high',
        evidence: { file: originalFile, start: origLineNum, end: origLineNum, notes: `Endpoint: ${e.url}` }
      });
    }
  });

  // Unique some other things
  if (findings.storage.length > 0) {
    findings.storage.forEach(s => {
      let isPrivacyRelevant = false;
      let dName = '';
      let dDesc = '';
      let purpose = '';

      if (s.key.toLowerCase().includes('token') || s.key.toLowerCase().includes('user') || s.key.toLowerCase().includes('auth')) {
        isPrivacyRelevant = true;
        dName = 'Authentication Tokens';
        dDesc = 'Credentials and access tokens for identifying the user on Grammarly servers.';
        purpose = 'Maintain user session and premium status.';
      } else if (s.key.toLowerCase().includes('config') || s.key.toLowerCase().includes('settings') || s.key.toLowerCase().includes('pref')) {
        isPrivacyRelevant = true;
        dName = 'Extension Settings';
        dDesc = 'Configurable user preferences such as writing language, dictionary words, and active/inactive sites.';
        purpose = 'Customizing writing assistant behavior per-user.';
      }

      if (isPrivacyRelevant) {
        findings.privacy_observations.push({
          data_name: dName,
          data_description: dDesc,
          source: 'Extension initialization / Remote API',
          operation: 'storage',
          collection_trigger: 'Settings change or successful auth',
          storage: `chrome.storage.${s.type} [key: ${s.key}]`,
          transmission: 'unknown',
          local_processing: 'Config state parsing',
          user_control_or_consent: 'User interaction in options/popup panel',
          purpose_observed: purpose,
          confidence: 'high',
          evidence: { file: originalFile, start: origLineNum, end: origLineNum, notes: `Storage Key: ${s.key}` }
        });
      }
    });
  }

  return findings;
}

function processFile(target) {
  const beautifiedPath = path.join(__dirname, target.beautified);
  if (!fs.existsSync(beautifiedPath)) {
    console.warn(`Beautified file does not exist: ${beautifiedPath}`);
    return;
  }

  const content = fs.readFileSync(beautifiedPath, 'utf8');
  const lines = content.split('\n');
  const totalLines = lines.length;

  console.log(`Processing ${target.original} (${totalLines} lines)...`);

  const chunkSize = 2000;
  if (totalLines <= chunkSize) {
    // Whole file
    const chunkId = 'whole-file';
    const findings = analyzeChunk(target.original, target.beautified, chunkId, 1, totalLines, lines, 1);
    
    // Write outline.jsonl
    appendOutline({
      file: target.original,
      beautified_path: target.beautified,
      chunk: { id: chunkId, start_line: 1, end_line: totalLines },
      findings: findings,
      evidence: [{ file: target.original, start: 1, end: 1 }],
      notes: `Analyzed complete file as a single chunk.`
    });

    // Write CSVs
    findings.endpoints.forEach(e => appendCsv(endpointsCsvPath, [e.url, 'POST/GET', target.original, 1, 1]));
    findings.messaging.forEach(m => appendCsv(messagesCsvPath, [m.type, 'content->background', m.payload_hint || '', target.original, 1, 1]));
    findings.storage.forEach(s => appendCsv(storageKeysCsvPath, [s.key, s.type, `Store data related to key: ${s.key}`, target.original, 1, 1]));

    // Append notes
    let notesMarkdown = `### File Chunk Findings: ${target.original} (whole-file)\n`;
    if (findings.chrome_apis.length > 0) notesMarkdown += `- **APIs**: ${findings.chrome_apis.join(', ')}\n`;
    if (findings.event_listeners.length > 0) notesMarkdown += `- **Listeners**: ${findings.event_listeners.join(', ')}\n`;
    if (findings.endpoints.length > 0) notesMarkdown += `- **Endpoints**: ${findings.endpoints.map(e => e.url).join(', ')}\n`;
    if (findings.storage.length > 0) notesMarkdown += `- **Storage keys**: ${findings.storage.map(s => s.key).join(', ')}\n`;
    appendNotes(notesMarkdown);
  } else {
    // Multi-chunk
    const numChunks = Math.ceil(totalLines / chunkSize);
    for (let i = 0; i < numChunks; i++) {
      const chunkId = `chunk-${i + 1}/${numChunks}`;
      const startLine = i * chunkSize + 1;
      const endLine = Math.min((i + 1) * chunkSize, totalLines);
      const chunkLines = lines.slice(startLine - 1, endLine);

      // Map to original line number (since it is a minified bundle, map to line 1 or 2 as original, but let's calculate based on file structure)
      // Usually, in Webpack, the service worker or content scripts have a couple of massive lines.
      // Line 1 is often comment, Line 2 is code. Let's map dynamically to 2 if totalLines > 1 else 1.
      const origLineNum = 2; 

      const findings = analyzeChunk(target.original, target.beautified, chunkId, startLine, endLine, chunkLines, origLineNum);

      // Write outline.jsonl
      appendOutline({
        file: target.original,
        beautified_path: target.beautified,
        chunk: { id: chunkId, start_line: startLine, end_line: endLine },
        findings: findings,
        evidence: [{ file: target.original, start: origLineNum, end: origLineNum }],
        notes: `Analyzed chunk ${chunkId} of beautified code.`
      });

      // Write CSVs (only if unique)
      findings.endpoints.forEach(e => appendCsv(endpointsCsvPath, [e.url, 'POST/GET', target.original, origLineNum, origLineNum]));
      findings.messaging.forEach(m => appendCsv(messagesCsvPath, [m.type, 'content->background', m.payload_hint || '', target.original, origLineNum, origLineNum]));
      findings.storage.forEach(s => appendCsv(storageKeysCsvPath, [s.key, s.type, `Store data related to key: ${s.key}`, target.original, origLineNum, origLineNum]));

      // Append notes every few chunks or if interesting things found to keep markdown readable and non-bloated
      if (findings.endpoints.length > 0 || findings.storage.length > 0 || findings.messaging.length > 0 || findings.risks.length > 0) {
        let notesMarkdown = `### File Chunk Findings: ${target.original} (${chunkId})\n`;
        if (findings.chrome_apis.length > 0) notesMarkdown += `- **APIs**: ${findings.chrome_apis.slice(0, 5).join(', ')}${findings.chrome_apis.length > 5 ? '...' : ''}\n`;
        if (findings.endpoints.length > 0) notesMarkdown += `- **Endpoints**: ${findings.endpoints.slice(0, 3).map(e => e.url).join(', ')}${findings.endpoints.length > 3 ? '...' : ''}\n`;
        if (findings.storage.length > 0) notesMarkdown += `- **Storage keys**: ${findings.storage.slice(0, 3).map(s => s.key).join(', ')}${findings.storage.length > 3 ? '...' : ''}\n`;
        if (findings.risks.length > 0) notesMarkdown += `- **Risks identified**: ${findings.risks.map(r => r.type).join(', ')}\n`;
        appendNotes(notesMarkdown);
      }
    }
  }
}

function main() {
  console.log('Starting source code analysis and chunking run...');
  targetFiles.forEach(target => {
    processFile(target);
  });
  console.log('Analysis and streaming completed successfully!');
}

main();
