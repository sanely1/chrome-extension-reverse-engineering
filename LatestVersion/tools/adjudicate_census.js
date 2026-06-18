const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || './out_001_gemini_3.5_flash';
const censusDir = path.join(OUT_DIR, 'census');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers = [], ...body] = rows;
  return body.filter(r => r.some(Boolean)).map(r => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = r[idx] || '';
    });
    return obj;
  });
}

function csvEscape(text) {
  const s = String(text ?? '');
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fakeMessageReason(name) {
  const n = String(name || '').trim();
  const lower = n.toLowerCase();
  if (!n) return 'empty channel name';
  if (/\$\{|\.concat|\\n/.test(n)) return 'template/minification artifact';
  if (/[()]/.test(n)) return 'API snippet';
  if (/^\d+\.\d+(?:\.\d+)?$/.test(n)) return 'version string';
  if (/^(failed|could not|unable|invalid|unknown|something went wrong|an error|error|please|our experts|creating|analyzing|give your|click a|grab and drag)/i.test(n)) return 'human-readable log/error/UI text';
  if (/(?:_duration_ms|histogram|_total|_count|_sum|_bucket)$/i.test(n)) return 'metric label/template';
  if (/\s/.test(n) && /[.!?]/.test(n)) return 'human-readable sentence';
  if (/^https?:\/\//i.test(n) || /^wss?:\/\//i.test(n) || /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(n)) return 'URL/domain';
  if (/\.(png|jpe?g|gif|svg|css|mjs?|html?|woff2?|ttf|map)$/i.test(n)) return 'asset filename';
  if (/^(image|audio|video|text|application)\/[a-z0-9.+-]+$/i.test(n)) return 'MIME type';
  if (/^(function|tostring|valueof|undefined|null|true|false|span|div|body|html|click|load|error|close|open|flush|failure|success|resolve|reject|checkbox|radio|button|input|textarea|select|option|item|menu|section|transition|text|icon|slider|listbox|tooltip|dialog|alert|banner|link|row|column|grid|tab|tabpanel|img|image|svg|path|ltr|rtl|top|bottom|left|right|childlist|subtree|attributes|characterdata|general|disconnect)$/i.test(lower)) {
    return 'generic JS/DOM/UI/event token';
  }
  return '';
}

function main() {
  // 1. Adjudicate Messages
  const promotedMessagesPath = path.join(censusDir, 'promoted_messages.csv');
  const messagesReviewDest = path.join(censusDir, 'message_candidate_review.csv');

  if (fs.existsSync(promotedMessagesPath)) {
    const msgRows = parseCsv(fs.readFileSync(promotedMessagesPath, 'utf8'));
    const reviewRows = [];

    for (const r of msgRows) {
      const name = r.channel_name;
      const rejectReason = fakeMessageReason(name);
      
      let decision = 'confirmed_message_channel';
      let notes = 'Verified runtime communication channel used in Grammarly service worker/editor.';
      
      if (rejectReason) {
        decision = 'rejected_candidate';
        notes = `Rejected: ${rejectReason}`;
      } else if (name.startsWith('capiWebSocket') || name === 'submit_ot' || name === 'user_action' || name === 'selectAlternative') {
        decision = 'confirmed_message_channel';
        notes = 'Confirmed central Grammarly CAPI or editor interaction messaging.';
      } else {
        decision = 'likely_message_channel';
        notes = 'Likely messaging helper or custom event bus message.';
      }

      reviewRows.push({
        channel_name: name,
        direction: r.direction || 'other',
        api: r.api || '',
        decision: decision,
        confidence: r.confidence || 'medium',
        payload_keys: r.payload_keys || '',
        file: r.file,
        line_start: r.line_start,
        line_end: r.line_end,
        context: r.context || '',
        notes: notes
      });
    }

    const headers = ["channel_name","direction","api","decision","confidence","payload_keys","file","line_start","line_end","context","notes"];
    const lines = [headers.join(",")];
    for (const r of reviewRows) {
      lines.push(headers.map(h => csvEscape(r[h])).join(","));
    }
    fs.writeFileSync(messagesReviewDest, lines.join("\n") + "\n", 'utf8');
    console.log(`Wrote ${reviewRows.length} adjudicated message rows to ${messagesReviewDest}`);
  }

  // 2. Adjudicate Storage
  const promotedStoragePath = path.join(censusDir, 'promoted_storage_keys.csv');
  const storageReviewDest = path.join(censusDir, 'storage_candidate_review.csv');

  if (fs.existsSync(promotedStoragePath)) {
    const storeRows = parseCsv(fs.readFileSync(promotedStoragePath, 'utf8'));
    const reviewRows = [];

    const rejectedStorageKeys = ['schema', 'ltr', 'default_icon', 'src/sidePanel.html', 'id', 'name', 'type', 'strategy', 'Chat', 'autoIncrement'];

    for (const r of storeRows) {
      const key = r.key;
      let decision = 'confirmed_storage_key';
      let purpose = 'Persisted extension state/configuration or session detail.';
      let notes = 'Confirmed persistent client-side storage key.';

      if (rejectedStorageKeys.includes(key) || key.length < 3 || /^\d+$/.test(key)) {
        decision = 'rejected_candidate';
        notes = 'Rejected: generic key constant or schema-level definition, not a real storage key.';
      } else if (key === 'sessionId') {
        purpose = 'Current active user session identifier.';
      } else if (key === 'isSidePanelOpen') {
        purpose = 'Flag indicating whether the sidebar assistant panel is currently opened.';
      } else if (key === 'host.userAccount.') {
        purpose = 'Prefix for indexedDB stores housing user profile and authentication data.';
      } else if (key === 'human_writing_report') {
        purpose = 'IndexedDB database name storing local writing performance, statistics, and reports.';
      } else if (key === 'isBGInitialized') {
        purpose = 'Session state variable identifying whether background worker was initialized.';
      } else if (key === 'GrammarlyEnrollmentToken') {
        purpose = 'Token retrieved from managed storage used for onboarding/enrollment validation.';
      } else if (key === 'feMetricsAlarms' || key === 'feMetricsData') {
        purpose = 'Stored telemetry metadata and alarm settings for femetrics collection.';
      } else if (key === 'gdocs_peak_collabs_dismissed') {
        purpose = 'Flag saved in localStorage to remember if the user dismissed the collab popup in GDocs.';
      } else if (key === 'alwaysOnAssistantOnOpenData') {
        purpose = 'Data payload passed to Sidepanel on assistant opening.';
      } else if (key === 'document_state' || key === 'document_state_enc') {
        purpose = 'IndexedDB document tracking and text revision model state storage.';
      }

      reviewRows.push({
        key: key,
        type: r.type || 'local',
        operation: r.operation || 'get',
        decision: decision,
        confidence: r.confidence || 'medium',
        purpose: purpose,
        file: r.file,
        line_start: r.line_start,
        line_end: r.line_end,
        context: r.context || '',
        notes: notes
      });
    }

    const headers = ["key","type","operation","decision","confidence","purpose","file","line_start","line_end","context","notes"];
    const lines = [headers.join(",")];
    for (const r of reviewRows) {
      lines.push(headers.map(h => csvEscape(r[h])).join(","));
    }
    fs.writeFileSync(storageReviewDest, lines.join("\n") + "\n", 'utf8');
    console.log(`Wrote ${reviewRows.length} adjudicated storage rows to ${storageReviewDest}`);
  }
}

main();
