#!/usr/bin/env node
/*
 * Promotes raw census candidates into reviewed CSV queues.
 *
 * The extractor intentionally over-collects. This script applies generic,
 * evidence-based filters so final summaries use promoted rows instead of raw
 * candidates directly.
 *
 * Usage:
 *   node tools/census_promoter.js [out_dir]
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outDir = path.resolve(root, process.argv[2] || './out_census');
const censusDir = path.join(outDir, 'census');

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  return '"' + s.replace(/"/g, '""').replace(/\r?\n/g, ' ').slice(0, 4000) + '"';
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else {
      if (ch === '"') quoted = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, 'utf8').trim();
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

function writeCsv(file, rows, headers) {
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  fs.writeFileSync(file, lines.join('\n') + '\n', 'utf8');
}

function norm(value) {
  return String(value || '').trim().replace(/[;,'")\]]+$/g, '').replace(/\/$/, '').toLowerCase();
}

function hasRuntimeNetworkEvidence(row) {
  const text = `${row.context || ''} ${row.source_hint || ''} ${row.method || ''}`;
  return /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|axios|request|httpClient|\.post\(|\.get\(|\.put\(|\.delete\(|\.patch\(|graphql|transport|beacon|postRaw|getRaw)\b/i.test(text);
}

function endpointNoiseReason(row) {
  const v = norm(row.value);
  const context = String(row.context || '').toLowerCase();
  if (!v) return 'empty endpoint value';
  if (/^https?:\/\/\*\/\*$/.test(v) || /^https?:\/\/\*\./.test(v) || v === '<all_urls>' || /\*\/\*$/.test(v)) return 'wildcard permission or match pattern, not a concrete endpoint';
  if (/^https?:\/$/.test(v) || /^https?:$/.test(v)) return 'truncated or malformed URL, not a concrete endpoint';
  if (/^https?:\/\/(www\.)?example\.com\b/.test(v)) return 'example placeholder URL, not runtime endpoint';
  if (/^https?:\/\/www\.w3\.org\/2000\/svg\b/.test(v)) return 'SVG namespace URL, not runtime endpoint';
  if (/\$\{[^}]+\}/.test(v)) return 'unexpanded template placeholder; use expanded candidates when available';
  if (/\b(registry\.npmjs\.org|npmjs\.com\/package|github\.com\/sponsors|opencollective\.com|github\.com\/.*\/(blob|tree)\/|raw\.githubusercontent\.com|yarnpkg\.com)\b/.test(v)) return 'package/developer metadata URL, not extension runtime endpoint';
  if (/\.(tgz|zip|map|md|markdown)(\?|#|$)/i.test(v)) return 'package, source-map, or documentation file URL';
  if (/^(https?:\/\/)?(reactjs\.org|preactjs\.com|typescriptlang\.org|schema\.org|w3\.org)\b/.test(v)) return 'developer documentation/reference URL';
  if (/^\/(div|span|body|html|head|button|input|svg|path)(\b|[.#\[])/i.test(v)) return 'DOM selector, not endpoint';
  if (/sourceMappingURL|license|package\.json|readme|changelog/.test(context) && !hasRuntimeNetworkEvidence(row)) return 'metadata/comment context without runtime network use';
  return '';
}

function endpointScore(row) {
  let score = 0;
  const v = norm(row.value);
  const text = `${v} ${row.kind || ''} ${row.method || ''} ${row.confidence || ''} ${row.context || ''} ${row.source_hint || ''}`;
  if (row.confidence === 'high') score += 3;
  else if (row.confidence === 'medium') score += 2;
  if (/^(https?|wss?):\/\//i.test(row.value || '')) score += 2;
  if (/relative_route/i.test(row.kind || row.source_hint || '')) score += 1;
  if (/template_route|concat_route/i.test(row.kind || row.source_hint || '')) score += 4;
  if (/expanded_placeholder_url|literal_placeholder_expansion|env_placeholder_expansion/i.test(row.kind || row.source_hint || '')) score += 4;
  if (/manifest_csp_report_uri/i.test(row.source_hint || row.context || '')) score += 4;
  if (/manifest_csp/i.test(row.source_hint || '') && !/report_uri/.test(row.source_hint || '')) score += 1;
  if (hasRuntimeNetworkEvidence(row)) score += 4;
  if (/\b(api|auth|oauth|token|userinfo|gateway|telemetry|metric|metrics|event|events|log|crash|batch|import|config|dynamicconfig|gate|gates|treatment|graphql|rpc|sync|beacon|privacy|subscription|account|cookie|session|dox|capi|gnar|femetrics|sentry|mixpanel|iterable|segment|amplitude|data)\b/i.test(text)) score += 2;
  if (row.method && !/unknown/i.test(row.method)) score += 1;
  return score;
}

function promoteEndpoints(rows) {
  const promoted = [];
  const excluded = [];
  const seen = new Set();
  for (const row of rows) {
    const valueKey = norm(row.value);
    if (!valueKey || seen.has(valueKey)) continue;
    seen.add(valueKey);
    const reason = endpointNoiseReason(row);
    const score = endpointScore(row);
    if (!reason && score >= 5) {
      promoted.push({ ...row, promotion_score: score, promotion_reason: 'runtime/CSP evidence passed generic endpoint promotion rules' });
    } else {
      excluded.push({ ...row, promotion_score: score, exclusion_reason: reason || `low promotion score (${score}) or insufficient runtime evidence` });
    }
  }
  return { promoted, excluded };
}

function messageNoiseReason(row) {
  const name = norm(row.channel_name);
  if (!name) return 'empty channel name';
  if (/^(function|tostring|valueof|undefined|null|true|false|\/|\/\/|span|div|body|html|click|load|error|close|open|flush|failure|success|resolve|reject|onreadystatechange|unhandledrejection|rejectionhandled)$/.test(name)) return 'generic JS/DOM/event token, not a message channel';
  if (name.length < 3) return 'too short to be a stable message channel';
  return '';
}

function messageScore(row) {
  let score = 0;
  const text = `${row.channel_name || ''} ${row.direction || ''} ${row.api || ''} ${row.context || ''}`;
  if (/chrome\.runtime|chrome\.tabs|browser\.runtime|browser\.tabs|postMessage|Port|connect|onMessage|sendMessage/i.test(text)) score += 3;
  if (/rpc|message|channel|bridge|background|content|iframe|webapp|command|handler|request|response|event/i.test(text)) score += 2;
  if (/^[a-z0-9_.:$#@/-]{4,120}$/i.test(row.channel_name || '')) score += 1;
  if (row.confidence === 'high') score += 2;
  else if (row.confidence === 'medium') score += 1;
  return score;
}

function promoteMessages(rows) {
  const promoted = [];
  const excluded = [];
  const seen = new Set();
  for (const row of rows) {
    const key = `${norm(row.channel_name)}|${norm(row.direction)}|${norm(row.api)}`;
    if (!norm(row.channel_name) || seen.has(key)) continue;
    seen.add(key);
    const reason = messageNoiseReason(row);
    const score = messageScore(row);
    if (!reason && score >= 4) promoted.push({ ...row, promotion_score: score, promotion_reason: 'message API/context passed generic promotion rules' });
    else excluded.push({ ...row, promotion_score: score, exclusion_reason: reason || `low promotion score (${score}) or insufficient messaging context` });
  }
  return { promoted, excluded };
}

function storageNoiseReason(row) {
  const key = norm(row.key);
  if (!key) return 'empty storage key';
  if (/^(rects|boundingbox|debug|retention|datatier|retry-after|x-sentry-rate-limits|polite|textchange|init|open|closed|width|height|left|top|bottom|right|url|path|domain|method|headers|body|name|value|type|data|payload|callback|resolve|reject|readonly|readwrite|versionchange|createobjectstore|deleteobjectstore|openurl|log|xhr|firefox|chrome|safari|edge|before|after|test|prod|dev|development|production|cookie|autoincrement|keypath|border-box|content-box|animation)$/.test(key)) return 'generic UI/debug/header/object token, not stable extension storage';
  if (key.length < 3) return 'too short to be a stable storage key';
  if (/^\d+$/.test(key)) return 'numeric literal, not a stable storage key';
  if (/[,{}()[\]"'`]/.test(key) || /\$\{/.test(key)) return 'compound/template value, not a stable storage key';
  if (/\s/.test(key)) return 'human-readable phrase, not a stable storage key';
  if (/^host\.indexeddb\.?/i.test(key)) return 'IndexedDB instrumentation/internal method token';
  if (/^https?:\/\//.test(key) || /^wss?:\/\//.test(key) || /^\/\//.test(key)) return 'URL, not a storage key';
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(key)) return 'domain, not a storage key';
  if (/^[#.[<{]/.test(key)) return 'selector/markup-looking token, not a storage key';
  if (/\.(png|jpe?g|gif|svg|css|mjs?|html?|woff2?|ttf|map)$/.test(key)) return 'asset filename, not a storage key';
  return '';
}

function storageScore(row) {
  let score = 0;
  const text = `${row.key || ''} ${row.type || ''} ${row.operation || ''} ${row.context || ''}`;
  if (/chrome\.storage|browser\.storage|localStorage|sessionStorage|indexedDB|cookie|cookies/i.test(text)) score += 3;
  if (/CacheStorage|caches\.|objectStore|deleteDatabase|createObjectStore/i.test(text)) score += 3;
  if (/storage|store|cache|persist|prefs?|preferences?|settings?|state|session|cookie|indexeddb|database|objectStore|local|sync|managed/i.test(text)) score += 2;
  if (/auth|token|jwt|session|sid|user|uid|profile|account|email|identity|device|client|machine|distinct|install|setting|pref|flag|experiment|abtest|cache|config|consent|privacy|telemetry|analytics|tracking|history|coupon|cart/i.test(text)) score += 2;
  if (/^[A-Z0-9_]{3,}$/.test(row.key || '') || /^[a-z][A-Za-z0-9]*(Key|Storage|Store|Token|Session|Setting|Config|Cache|Id|ID)$/.test(row.key || '')) score += 1;
  if (row.type === 'storage_key_constant' && row.confidence === 'low') score -= 1;
  if (row.confidence === 'high') score += 2;
  else if (row.confidence === 'medium') score += 1;
  if (row.type === 'storage_key_constant' && !/(key|token|storage|store|cache|session|setting|settings|config|pref|preference|id|user|auth|cookie|indexeddb|database|consent|privacy|telemetry|analytics|install|profile|account)/i.test(row.key || '')) score -= 3;
  return score;
}

function promoteStorage(rows) {
  const promoted = [];
  const excluded = [];
  const seen = new Set();
  for (const row of rows) {
    const key = `${norm(row.key)}|${norm(row.type)}`;
    if (!norm(row.key) || seen.has(key)) continue;
    seen.add(key);
    const reason = storageNoiseReason(row);
    const score = storageScore(row);
    const threshold = row.type === 'storage_key_constant' ? 8 : 5;
    if (!reason && score >= threshold) promoted.push({ ...row, promotion_score: score, promotion_reason: 'storage API/key context passed generic promotion rules' });
    else excluded.push({ ...row, promotion_score: score, exclusion_reason: reason || `low promotion score (${score}) or insufficient storage context` });
  }
  return { promoted, excluded };
}

function main() {
  if (!fs.existsSync(censusDir)) {
    console.error(`[promoter] census directory not found: ${censusDir}`);
    process.exit(2);
  }

  const endpoints = promoteEndpoints(readCsv(path.join(censusDir, 'endpoints_candidates.csv')));
  const messages = promoteMessages(readCsv(path.join(censusDir, 'message_candidates.csv')));
  const storage = promoteStorage(readCsv(path.join(censusDir, 'storage_candidates.csv')));

  writeCsv(path.join(censusDir, 'promoted_endpoints.csv'), endpoints.promoted, ['value','kind','method','confidence','promotion_score','promotion_reason','file','line_start','line_end','context','source_hint']);
  writeCsv(path.join(censusDir, 'excluded_endpoints.csv'), endpoints.excluded, ['value','kind','method','confidence','promotion_score','exclusion_reason','file','line_start','line_end','context','source_hint']);

  writeCsv(path.join(censusDir, 'promoted_messages.csv'), messages.promoted, ['channel_name','direction','api','confidence','promotion_score','promotion_reason','payload_keys','file','line_start','line_end','context']);
  writeCsv(path.join(censusDir, 'excluded_messages.csv'), messages.excluded, ['channel_name','direction','api','confidence','promotion_score','exclusion_reason','payload_keys','file','line_start','line_end','context']);

  writeCsv(path.join(censusDir, 'promoted_storage_keys.csv'), storage.promoted, ['key','type','operation','confidence','promotion_score','promotion_reason','file','line_start','line_end','context']);
  writeCsv(path.join(censusDir, 'excluded_storage_keys.csv'), storage.excluded, ['key','type','operation','confidence','promotion_score','exclusion_reason','file','line_start','line_end','context']);

  const summary = {
    out_dir: outDir,
    endpoints: { promoted: endpoints.promoted.length, excluded: endpoints.excluded.length },
    messages: { promoted: messages.promoted.length, excluded: messages.excluded.length },
    storage: { promoted: storage.promoted.length, excluded: storage.excluded.length },
    generated_at: new Date().toISOString()
  };
  fs.writeFileSync(path.join(censusDir, 'promotion_summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(`[promoter] endpoints=${summary.endpoints.promoted}/${summary.endpoints.promoted + summary.endpoints.excluded} messages=${summary.messages.promoted}/${summary.messages.promoted + summary.messages.excluded} storage=${summary.storage.promoted}/${summary.storage.promoted + summary.storage.excluded}`);
}

main();
