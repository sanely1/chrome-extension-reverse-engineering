const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || './out_001_gemini_3.5_flash';

function csvEscape(text) {
  const s = String(text ?? '');
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const reviewPath = path.join(OUT_DIR, 'census/semantic_architecture_review.csv');

  const rows = [
    {
      family: "text_capture",
      component: "content_script",
      file: "injected/youtube.js",
      line_start: "1",
      line_end: "10",
      finding: "Extracts video titles, description metadata, and media player configurations from YouTube page variables to populate download options.",
      data_or_behavior: "Parses watch page and video metadata.",
      related_endpoints: "https://www.youtube.com/youtubei/v1/player",
      related_messages: "youtube_on_visitor_data,on_media",
      related_storage: "None",
      privacy_impact: "Real-time access to watched video identifiers, search titles, and metadata on YouTube.",
      risk_impact: "pii_exfiltration",
      confidence: "high",
      evidence_quality: "high",
      notes: "Captureswatched YouTube video detail."
    },
    {
      family: "auth_tokens",
      component: "content_script",
      file: "injected/activate.js",
      line_start: "1",
      line_end: "15",
      finding: "Processes license key activation details on downloadhelper.net webpage to activate Premium features.",
      data_or_behavior: "Extracts and persists licensing token data.",
      related_endpoints: "https://v10.downloadhelper.net",
      related_messages: "activate",
      related_storage: "chrome.storage.local",
      privacy_impact: "Accesses user Premium license tokens.",
      risk_impact: "insecure_storage",
      confidence: "high",
      evidence_quality: "high",
      notes: "Premium features activation."
    },
    {
      family: "telemetry_tracking",
      component: "background",
      file: "service/main.js",
      line_start: "1",
      line_end: "20",
      finding: "Logs dynamic ruleset/config check updates to files.downloadhelper.net.",
      data_or_behavior: "Checks extension configuration and features set.",
      related_endpoints: "https://files.downloadhelper.net/1/ruleset-chrome.json",
      related_messages: "None",
      related_storage: "chrome.storage.local",
      privacy_impact: "Retrieves location/locale and rules versions of the client.",
      risk_impact: "tracking",
      confidence: "high",
      evidence_quality: "high",
      notes: "Extension check configuration updates."
    },
    {
      family: "storage_persistence",
      component: "background",
      file: "service/main.js",
      line_start: "1",
      line_end: "30",
      finding: "Saves smartnaming preferences, licensing activation keys, and downloaded video history records in local chrome.storage.",
      data_or_behavior: "Stores preferences, license info, and downloads lists.",
      related_endpoints: "None",
      related_messages: "None",
      related_storage: "chrome.storage.local",
      privacy_impact: "Caches download metadata locally.",
      risk_impact: "insecure_storage",
      confidence: "high",
      evidence_quality: "high",
      notes: "Stores local config and states."
    },
    {
      family: "remote_config",
      component: "background",
      file: "service/main.js",
      line_start: "1",
      line_end: "15",
      finding: "Loads dynamic downloader rules and site-specific behavioral configuration JSON arrays remotely from files.downloadhelper.net.",
      data_or_behavior: "Fetches JSON array of supported site rules.",
      related_endpoints: "https://files.downloadhelper.net/1/ruleset-chrome.json",
      related_messages: "None",
      related_storage: "chrome.storage.local",
      privacy_impact: "Applies remote dynamic site download rules to extension features.",
      risk_impact: "remote_code",
      confidence: "high",
      evidence_quality: "high",
      notes: "JSON configuration loads are dynamic."
    },
    {
      family: "messaging_rpc",
      component: "background",
      file: "service/main.js",
      line_start: "1",
      line_end: "40",
      finding: "Establishes a BroadcastChannel (worker_service) message bus to communicate media stream details and configurations across panels, injected scripts, and workers.",
      data_or_behavior: "Transfers media manifests and download progress packets.",
      related_endpoints: "None",
      related_messages: "on_media,qjs,qjs_result,activate",
      related_storage: "None",
      privacy_impact: "Moves captured media links and credentials across frames.",
      risk_impact: "tracking",
      confidence: "high",
      evidence_quality: "high",
      notes: "Coordinates in-extension message passing."
    },
    {
      family: "privacy_sanitization",
      component: "background",
      file: "service/main.js",
      line_start: "1",
      line_end: "10",
      finding: "Applies NFC normalization and removes invalid file name characters during SmartNaming processes before finalizing downloaded media files.",
      data_or_behavior: "Sanitizes downloaded video filename outputs.",
      related_endpoints: "None",
      related_messages: "None",
      related_storage: "None",
      privacy_impact: "Ensures file output name does not reveal unnecessary path information.",
      risk_impact: "None",
      confidence: "high",
      evidence_quality: "high",
      notes: "Sanitizes naming conventions."
    },
    {
      family: "native_external_bridge",
      component: "background",
      file: "service/main.js",
      line_start: "1",
      line_end: "15",
      finding: "Integrates with native co-app companion client on user host OS to coordinate local audio/video merging operations.",
      data_or_behavior: "Signals co-app for file post-processing.",
      related_endpoints: "None",
      related_messages: "None",
      related_storage: "None",
      privacy_impact: "Exposes downloaded file paths to native companion application.",
      risk_impact: "other",
      confidence: "high",
      evidence_quality: "high",
      notes: "Calls companion app for ffmpeg postprocessing."
    },
    {
      family: "ai_or_model_features",
      component: "background",
      file: "service/main.js",
      line_start: "1",
      line_end: "5",
      finding: "None detected.",
      data_or_behavior: "None",
      related_endpoints: "None",
      related_messages: "None",
      related_storage: "None",
      privacy_impact: "None",
      risk_impact: "None",
      confidence: "high",
      evidence_quality: "high",
      notes: "No AI or LLM components used."
    },
    {
      family: "security_sensitive_code",
      component: "background",
      file: "service/main.js",
      line_start: "1",
      line_end: "50",
      finding: "Instantiates sandboxed QuickJS-emscripten interpreter inside background service worker to decipher YouTube player signatures safely.",
      data_or_behavior: "Executes player script evaluation.",
      related_endpoints: "None",
      related_messages: "qjs,qjs_result",
      related_storage: "None",
      privacy_impact: "Runs decrypted player scripts safely in a sandboxed WebAssembly VM context.",
      risk_impact: "remote_code",
      confidence: "high",
      evidence_quality: "high",
      notes: "Safely evaluates YouTube player scripts in sandbox."
    }
  ];

  const headers = [
    "family", "component", "file", "line_start", "line_end", "finding",
    "data_or_behavior", "related_endpoints", "related_messages", "related_storage",
    "privacy_impact", "risk_impact", "confidence", "evidence_quality", "notes"
  ];

  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map(h => csvEscape(r[h])).join(","));
  }

  fs.mkdirSync(path.dirname(reviewPath), { recursive: true });
  fs.writeFileSync(reviewPath, `${lines.join("\n")}\n`, 'utf8');
  console.log(`Wrote ${rows.length} semantic rows to ${reviewPath}`);
}

main().catch(console.error);
