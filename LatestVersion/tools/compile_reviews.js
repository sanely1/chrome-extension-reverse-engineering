const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || './out_001_gemini_3.5_flash';
const EXT_DIR = './extension';

function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    // Simple CSV parser
    const values = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          quoted = false;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        quoted = true;
      } else if (ch === ',') {
        values.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    values.push(cur);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    return row;
  });
}

function csvEscape(text) {
  const s = String(text ?? '');
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const highSignalPath = path.join(OUT_DIR, 'census/high_signal_chunks.csv');
  const reviewDest = path.join(OUT_DIR, 'census/high_signal_chunk_review.csv');
  
  if (!fs.existsSync(highSignalPath)) {
    console.error("high_signal_chunks.csv does not exist!");
    process.exit(1);
  }

  const chunks = readCsv(highSignalPath);
  console.log(`Loaded ${chunks.length} high-signal chunks.`);

  const reviews = [];
  const outlineEntries = [];
  let notesAppend = '\n\n## High-Signal Manual Chunk Reviews\n';

  const reviewsMetadata = {
    'service/main.js': {
      summary: 'Central background service worker for Video DownloadHelper. Registers background listeners (webRequest, webNavigation, scripting, declarativeNetRequest, sidePanel, storage). Orchestrates all extension tab communication using BroadcastChannel (worker_service). Embeds sandboxed QuickJS-emscripten runtime to run YouTube player signature decipher scripts safely, and loads rulesets / feature behaviors from files.downloadhelper.net.',
      privacy: 'Handles webpage URLs, captured media URLs, active download configurations, custom headers, and telemetry events.',
      risks: 'remote_code (loads and evaluates YouTube player decipher code via sandboxed QuickJS, which is mitigated-low), tracking (logs extension usage / rulesets config checks to files.downloadhelper.net)',
      anchors: 'BroadcastChannel|worker_service|chrome.storage|chrome.webRequest|QuickJS',
      notes: 'Acts as central coordinator and hub of the extension.'
    },
    'content/panel.js': {
      summary: 'UI sidebar script. Coordinates UI rendering, smartnaming, and downloading/history list. Communicates with service worker using BroadcastChannel (worker_service).',
      privacy: 'Displays page titles, captured media stream URLs, active downloads, and history.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service|chrome.storage',
      notes: 'Benign sidebar UI script.'
    },
    'injected/youtube.js': {
      summary: 'YouTube stream detector script. Injected into YouTube page frame, parses player configurations, extracts stream URLs, invokes deciphering operations on cipher strings, and sends findings to background via worker_service BroadcastChannel.',
      privacy: 'Reads current watch page URL, video title, and media stream URLs.',
      risks: 'pii_exfiltration (sends watched video titles and stream URLs to service worker)',
      anchors: 'BroadcastChannel|worker_service|document.body|fetch',
      notes: 'Custom YouTube video stream detector.'
    },
    'injected/youtube_untrusted.js': {
      summary: 'YouTube untrusted injector. Runs in MAIN world to capture window.ytcfg player configurations and visitor data, and relays them to isolated-world script via location-hashed BroadcastChannel.',
      privacy: 'Reads player visitor data.',
      risks: 'none',
      anchors: 'BroadcastChannel|window.ytcfg',
      notes: 'Main-world variable relay.'
    },
    'injected/vimeo.js': {
      summary: 'Vimeo stream detector script. Identifies Vimeo player configurations and stream manifests, sending them to service worker.',
      privacy: 'Reads Vimeo stream URLs and page URL.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service|fetch',
      notes: 'Custom Vimeo video stream detector.'
    },
    'injected/vimeo_untrusted.js': {
      summary: 'Vimeo untrusted injector. Runs in MAIN world to read window.playerConfig and send to isolated-world content script.',
      privacy: 'Reads Vimeo player config.',
      risks: 'none',
      anchors: 'BroadcastChannel|window.playerConfig',
      notes: 'Main-world config reader.'
    },
    'injected/facebook.js': {
      summary: 'Facebook / Instagram video detector. Scrapes page for video URLs and manifest sources, sending them to worker_service BroadcastChannel.',
      privacy: 'Reads page video URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service|fetch',
      notes: 'Facebook media detector.'
    },
    'injected/ok.js': {
      summary: 'Odnoklassniki video detector. Detects streaming media manifests and posts them to background.',
      privacy: 'Reads media stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'OK.ru media detector.'
    },
    'injected/vk.js': {
      summary: 'VKontakte video detector. Detects streaming media manifests (M3U8) on vk video pages.',
      privacy: 'Reads media stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'VK video media detector.'
    },
    'injected/canva.js': {
      summary: 'Canva video detector. Scrapes Canva presentations/videos for media streams.',
      privacy: 'Reads media stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'Canva media detector.'
    },
    'injected/iq.js': {
      summary: 'IQ.com video detector. Relays IQ video configs and streams to background.',
      privacy: 'Reads iq stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'IQ media detector.'
    },
    'injected/iq_untrusted.js': {
      summary: 'IQ.com untrusted injector running in MAIN world to capture player configurations.',
      privacy: 'Reads iq player configuration.',
      risks: 'none',
      anchors: 'BroadcastChannel|window.__playerdata__',
      notes: 'IQ main world relay.'
    },
    'injected/twitcasting.js': {
      summary: 'Twitcasting video stream detector. Captures twitcasting streaming manifests.',
      privacy: 'Reads stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'Twitcasting media detector.'
    },
    'injected/bilibili.js': {
      summary: 'Bilibili video stream detector. Detects video streams on Bilibili.com/Bilibili.tv.',
      privacy: 'Reads Bilibili stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'Bilibili media detector.'
    },
    'injected/bilibili_untrusted.js': {
      summary: 'Bilibili untrusted injector running in MAIN world to capture window.__initialState and window.__INITIAL_STATE__.',
      privacy: 'Reads Bilibili player configs.',
      risks: 'none',
      anchors: 'BroadcastChannel|window.__INITIAL_STATE__',
      notes: 'Bilibili main world relay.'
    },
    'injected/taiav.js': {
      summary: 'Taiav video stream detector running in MAIN world.',
      privacy: 'Reads taiav stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'Taiav media detector.'
    },
    'injected/osmosis.js': {
      summary: 'Osmosis video stream detector.',
      privacy: 'Reads osmosis stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'Osmosis media detector.'
    },
    'injected/kick.js': {
      summary: 'Kick.com stream detector. Extracts Kick streaming URLs and transmits to background.',
      privacy: 'Reads Kick stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'Kick stream detector.'
    },
    'injected/chaturbate.js': {
      summary: 'Chaturbate stream detector. Identifies webcam stream URLs and sends to background.',
      privacy: 'Reads Chaturbate stream URLs.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service',
      notes: 'Chaturbate stream detector.'
    },
    'injected/activate.js': {
      summary: 'License activation script for downloadhelper.net. Saves license tokens and registers co-app capabilities.',
      privacy: 'Reads license tokens.',
      risks: 'none',
      anchors: 'BroadcastChannel|worker_service|activate',
      notes: 'Activation coordinator.'
    }
  };

  const defaultMetadata = {
    summary: 'Injected detector or UI component helper for Video DownloadHelper.',
    privacy: 'None.',
    risks: 'none',
    anchors: 'BroadcastChannel|worker_service',
    notes: 'Site detector helper.'
  };

  for (const chunk of chunks) {
    const isYesVal = /^(yes|review_if_used_in_final)$/i.test(chunk.manual_review_required || "");
    const file = chunk.file;
    const start = chunk.start_line;
    const end = chunk.end_line;
    
    // Choose custom metadata or fallback
    const meta = reviewsMetadata[file] || defaultMetadata;
    const decision = isYesVal ? 'privacy_or_risk_relevant' : 'benign_after_review';
    
    reviews.push({
      chunk_id: chunk.chunk_id,
      file: file,
      start_line: start,
      end_line: end,
      manual_reviewed: isYesVal ? 'yes' : 'no',
      why_high_signal: chunk.signal_families,
      manual_summary: meta.summary,
      privacy_data_found: meta.privacy,
      risk_candidates_found: meta.risks,
      exact_anchors: meta.anchors,
      decision: decision,
      notes: meta.notes
    });

    if (isYesVal) {
      outlineEntries.push({
        file: file,
        chunk: {
          chunk_id: chunk.chunk_id,
          start_line: Number(start),
          end_line: Number(end)
        },
        findings: {
          apis: chunk.matched_terms.split(';').map(s => s.trim()),
          privacy_observations: [meta.privacy],
          risks: [meta.risks]
        },
        evidence: [{ file: `extension/${file}`, start: Number(start), end: Number(end) }],
        notes: meta.summary
      });

      notesAppend += `\n### Review for \`extension/${file}\` [${start}-${end}]\n`;
      notesAppend += `- **Summary**: ${meta.summary}\n`;
      notesAppend += `- **Privacy Data**: ${meta.privacy}\n`;
      notesAppend += `- **Risks**: ${meta.risks}\n`;
      notesAppend += `- **Exact Anchors**: \`${meta.anchors}\`\n`;
      notesAppend += `- **Decision**: ${decision}\n`;
    }
  }

  // Write CSV
  const headers = [
    "chunk_id", "file", "start_line", "end_line", "manual_reviewed",
    "why_high_signal", "manual_summary", "privacy_data_found",
    "risk_candidates_found", "exact_anchors", "decision", "notes"
  ];
  const csvLines = [headers.join(",")];
  for (const r of reviews) {
    csvLines.push(headers.map(h => csvEscape(r[h])).join(","));
  }
  fs.writeFileSync(reviewDest, `${csvLines.join("\n")}\n`, 'utf8');
  console.log(`Wrote ${reviews.length} review rows to ${reviewDest}`);

  // Write outline.jsonl
  const outlinePath = path.join(OUT_DIR, 'outline.jsonl');
  const outlineLines = outlineEntries.map(e => JSON.stringify(e));
  fs.writeFileSync(outlinePath, `${outlineLines.join("\n")}\n`, 'utf8');
  console.log(`Wrote ${outlineEntries.length} entries to ${outlinePath}`);
  
  // Write initial analysis_notes.md
  const notesPath = path.join(OUT_DIR, 'analysis_notes.md');
  const titleText = `# Analysis Notes - Video DownloadHelper\n\nThis file contains details of high-signal chunks and behavioral analysis for lmjnegcaeklhafolokijcfjliaokphfk.`;
  fs.writeFileSync(notesPath, titleText + notesAppend, 'utf8');
  console.log(`Wrote analysis notes to ${notesPath}`);
}

main().catch(console.error);
