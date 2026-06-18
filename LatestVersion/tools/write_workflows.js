const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || './out_001_gemini_3.5_flash';

function csvEscape(text) {
  const s = String(text ?? '');
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const candPath = path.join(OUT_DIR, 'census/workflow_candidates.csv');
  const reviewPath = path.join(OUT_DIR, 'census/workflow_candidate_review.csv');

  // 1. Write Candidates
  const candHeaders = [
    "candidate_name","category","trigger_signals","message_signals","endpoint_signals","storage_signals","component_signals","evidence_files","confidence","notes"
  ];
  const candRows = [
    {
      candidate_name: "extension initialization and onboarding",
      category: "lifecycle/install/update/startup/onboarding",
      trigger_signals: "chrome.runtime.onInstalled,chrome.runtime.onStartup",
      message_signals: "None",
      endpoint_signals: "https://files.downloadhelper.net/1/ruleset-chrome.json",
      storage_signals: "rulesets,smartnaming",
      component_signals: "background",
      evidence_files: "service/main.js",
      confidence: "high",
      notes: "Sets up preferred settings, smartnaming, and dynamic supported site rulesets."
    },
    {
      candidate_name: "video stream detection",
      category: "content-script page interaction, DOM reading, metadata extraction, text capture, form interaction, or page modification",
      trigger_signals: "page load, network requests, DOM elements",
      message_signals: "on_media,youtube_on_visitor_data,vimeo_on_config,bilibili_com_on_id",
      endpoint_signals: "None",
      storage_signals: "None",
      component_signals: "content_script,web_accessible_resources",
      evidence_files: "injected/youtube.js,injected/vimeo.js,injected/facebook.js,injected/vk.js,injected/bilibili.js",
      confidence: "high",
      notes: "Scrapes video page or parses video configurations to capture M3U8, MPD or direct video urls."
    },
    {
      candidate_name: "signature deciphering sandbox",
      category: "permissions/DNR/webRequest/scripting/injection/security behavior",
      trigger_signals: "cipher signature detected",
      message_signals: "qjs,qjs_result",
      endpoint_signals: "None",
      storage_signals: "None",
      component_signals: "background,content_script",
      evidence_files: "service/main.js,injected/youtube.js",
      confidence: "high",
      notes: "Safely evaluates YouTube player decryption script inside a WebAssembly QuickJS sandbox."
    },
    {
      candidate_name: "media download and post-processing",
      category: "UI/popup/options/sidepanel/injected overlay/widget behavior",
      trigger_signals: "user click popup download",
      message_signals: "worker_service",
      endpoint_signals: "None",
      storage_signals: "downloads history",
      component_signals: "background,ui,worker",
      evidence_files: "service/main.js,content/panel.js,download_worker/main.js",
      confidence: "high",
      notes: "Processes downloads or launches ffmpeg merge worker locally, or sends streams to native co-app."
    },
    {
      candidate_name: "license key activation",
      category: "auth/account/session/identity/cookies",
      trigger_signals: "webpage load downloadhelper.net/activate",
      message_signals: "activate",
      endpoint_signals: "https://v10.downloadhelper.net",
      storage_signals: "license status",
      component_signals: "content_script,background",
      evidence_files: "injected/activate.js,service/main.js",
      confidence: "high",
      notes: "Saves Premium licensing key in local storage."
    }
  ];

  const linesCand = [candHeaders.join(",")];
  for (const r of candRows) {
    linesCand.push(candHeaders.map(h => csvEscape(r[h])).join(","));
  }
  fs.writeFileSync(candPath, `${linesCand.join("\n")}\n`, 'utf8');
  console.log(`Wrote ${candRows.length} rows to ${candPath}`);

  // 2. Write Review
  const revHeaders = [
    "candidate_name","decision","reason","category","triggers","steps_summary","apis","messages","endpoints","storage_keys","evidence_files"
  ];
  const revRows = [
    {
      candidate_name: "extension initialization and onboarding",
      decision: "confirmed_workflow",
      reason: "Directly verified in service worker start logic.",
      category: "lifecycle/install/update/startup/onboarding",
      triggers: "chrome.runtime.onInstalled, chrome.runtime.onStartup",
      steps_summary: "Service worker boots -> Initializes default templates for smartnaming -> Downloads latest ruleset from files.downloadhelper.net -> Persists rules locally.",
      apis: "chrome.runtime.onInstalled.addListener, chrome.runtime.onStartup.addListener",
      messages: "None",
      endpoints: "https://files.downloadhelper.net/1/ruleset-chrome.json",
      storage_keys: "rulesets",
      evidence_files: "service/main.js"
    },
    {
      candidate_name: "video stream detection",
      decision: "confirmed_workflow",
      reason: "Core media capture capabilities across major site-specific detectors.",
      category: "content-script page interaction, DOM reading, metadata extraction, text capture, form interaction, or page modification",
      triggers: "video page load, video player initialization",
      steps_summary: "Injected script loads -> MAIN world untrusted script relays player variables -> Isolated world script parses streams, sizes, codecs, and manifests -> Relays media info via BroadcastChannel worker_service.",
      apis: "fetch, BroadcastChannel",
      messages: "on_media, youtube_on_visitor_data, vimeo_on_config, bilibili_com_on_id",
      endpoints: "None",
      storage_keys: "None",
      evidence_files: "injected/youtube.js, injected/vimeo.js, injected/facebook.js, injected/vk.js, injected/bilibili.js"
    },
    {
      candidate_name: "signature deciphering sandbox",
      decision: "confirmed_workflow",
      reason: "Directly verified sandboxed QuickJS execution in YouTube flows.",
      category: "permissions/DNR/webRequest/scripting/injection/security behavior",
      triggers: "YouTube watch page loaded with cipher signature",
      steps_summary: "Injected script sends cipher decryption script to service worker -> Service worker creates sandboxed QuickJS WebAssembly instance -> Evaluates cipher script -> Deciphers signature -> Returns success/fail.",
      apis: "fetch",
      messages: "qjs, qjs_result",
      endpoints: "None",
      storage_keys: "None",
      evidence_files: "service/main.js, injected/youtube.js"
    },
    {
      candidate_name: "media download and post-processing",
      decision: "confirmed_workflow",
      reason: "Downloads and local merging flows using ffmpeg WASM or native co-app client.",
      category: "UI/popup/options/sidepanel/injected overlay/widget behavior",
      triggers: "user click captured media download option",
      steps_summary: "User triggers download -> Background downloads video segments -> For separate streams, initializes ffmpeg/libav download worker -> Local WASM merge merges stream files -> Alternately triggers native co-app to write/merge local files.",
      apis: "chrome.downloads.download",
      messages: "worker_service",
      endpoints: "None",
      storage_keys: "downloads history",
      evidence_files: "service/main.js, content/panel.js, download_worker/main.js"
    },
    {
      candidate_name: "license key activation",
      decision: "confirmed_workflow",
      reason: "Verified license activation script injected on downloadhelper.net.",
      category: "auth/account/session/identity/cookies",
      triggers: "page loaded on downloadhelper.net/activate",
      steps_summary: "Injected activate.js catches license activation event -> Sends token payload to service worker -> Background persists license token to local storage.",
      apis: "BroadcastChannel",
      messages: "activate",
      endpoints: "https://v10.downloadhelper.net",
      storage_keys: "license status",
      evidence_files: "injected/activate.js, service/main.js"
    }
  ];

  const linesRev = [revHeaders.join(",")];
  for (const r of revRows) {
    linesRev.push(revHeaders.map(h => csvEscape(r[h])).join(","));
  }
  fs.writeFileSync(reviewPath, `${linesRev.join("\n")}\n`, 'utf8');
  console.log(`Wrote ${revRows.length} rows to ${reviewPath}`);
}

main().catch(console.error);
