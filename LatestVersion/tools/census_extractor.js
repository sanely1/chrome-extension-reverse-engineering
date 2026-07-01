#!/usr/bin/env node
/*
 * Universal census extractor for Chrome extension reverse-engineering runs.
 * It mechanically collects candidates for network endpoints, messaging channels,
 * storage keys, and suspicious string constants before LLM synthesis.
 *
 * Usage:
 *   node tools/census_extractor.js [extension_dir] [out_dir]
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const extensionDir = path.resolve(root, process.argv[2] || './extension');
const outDir = path.resolve(root, process.argv[3] || './out_census');
const censusDir = path.join(outDir, 'census');

const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.html', '.json']);
const SKIP_PARTS = new Set(['node_modules', '.git', 'coverage', 'dist', 'build', 'privacy_workspace']);
const SKIP_FILES = new Set(['package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'yarn.lock']);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  return '"' + s.replace(/"/g, '""').replace(/\r?\n/g, ' ').slice(0, 4000) + '"';
}

function writeCsv(file, rows, headers) {
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  fs.writeFileSync(file, lines.join('\n') + '\n', 'utf8');
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(extensionDir, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (SKIP_PARTS.has(entry.name) || /^out_\d+/i.test(entry.name)) continue;
      walk(full, acc);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(ext)) continue;
      if (SKIP_FILES.has(entry.name.toLowerCase())) continue;
      if (/beautified/i.test(entry.name)) continue;
      acc.push({ full, rel });
    }
  }
  return acc;
}

function buildLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return starts;
}

function lineOfIndex(lineStarts, index) {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lineStarts[mid] <= index) lo = mid + 1;
    else hi = mid - 1;
  }
  return hi + 1;
}

function lineText(lines, line) {
  return (lines[line - 1] || '').trim();
}

function rawContext(text, index, radius = 450) {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return text.slice(start, end).replace(/\s+/g, ' ').trim().slice(0, 900);
}

function addUnique(map, key, row) {
  if (!map.has(key)) map.set(key, row);
}

function looksLikeUsefulMessageName(name) {
  const n = String(name || '').trim();
  if (!n || n.length < 2 || n.length > 180) return false;
  if (/^\d+$/.test(n)) return false;
  if (/^https?:\/\//i.test(n) || /^wss?:\/\//i.test(n) || /^\/\//.test(n)) return false;
  if (isDomain(n)) return false;
  if (/\.(png|jpe?g|gif|svg|css|mjs?|html?|woff2?|ttf|map)$/i.test(n)) return false;
  if (/^(GET|POST|PUT|PATCH|DELETE|http|https|function|tostring|valueof|undefined|null|true|false|span|div|body|html|click|load|error|close|open|flush|failure|success|resolve|reject|message|event|data|payload|callback|name|value|type)$/i.test(n)) return false;
  if (/\s/.test(n) && !/^[A-Z][A-Za-z0-9 _.-]{2,80}$/.test(n)) return false;
  return true;
}

function extractPayloadKeys(snippet) {
  const keys = new Set();
  let m;
  const propRe = /(?:^|[,{]\s*)([A-Za-z_$][\w$-]*)\s*:/g;
  while ((m = propRe.exec(snippet || ''))) {
    if (!/^(true|false|null|undefined)$/.test(m[1])) keys.add(m[1]);
  }
  return Array.from(keys).slice(0, 40).join('|');
}

function extractMessageNamesFromSnippet(snippet) {
  const names = new Set();
  let m;
  const text = snippet || '';
  const fieldRe = /\b(?:type|message|event|eventName|action|command|cmd|method|name|kind|channel|topic)\s*[:=]\s*['"`]([^'"`]{2,180})['"`]/g;
  while ((m = fieldRe.exec(text))) {
    if (looksLikeUsefulMessageName(m[1])) names.add(m[1]);
  }
  const compareRe = /\b(?:type|message|event|eventName|action|command|cmd|method|name|kind|channel|topic)\b[^=!<>]{0,40}(?:===|==|=)\s*['"`]([^'"`]{2,180})['"`]/g;
  while ((m = compareRe.exec(text))) {
    if (looksLikeUsefulMessageName(m[1])) names.add(m[1]);
  }
  const caseRe = /\bcase\s+['"`]([^'"`]{2,180})['"`]\s*:/g;
  while ((m = caseRe.exec(text))) {
    if (looksLikeUsefulMessageName(m[1])) names.add(m[1]);
  }
  const eventCtorRe = /\b(?:CustomEvent|MessageEvent)\s*\(\s*['"`]([^'"`]{2,180})['"`]/g;
  while ((m = eventCtorRe.exec(text))) {
    if (looksLikeUsefulMessageName(m[1])) names.add(m[1]);
  }
  return Array.from(names).slice(0, 50);
}

function addMessageCandidate(buckets, row) {
  const channel = String(row.channel_name || '').trim();
  if (!looksLikeUsefulMessageName(channel)) return;
  addUnique(buckets.messages, `${channel}|${row.direction}|${row.api}|${row.file}|${row.line_start}`, {
    ...row,
    channel_name: channel
  });
}

function normalizeStorageKey(key) {
  return String(key || '')
    .replace(/^['"`]|['"`]$/g, '')
    .trim();
}

function looksLikeUsefulStorageKey(key) {
  const k = normalizeStorageKey(key);
  if (!k || k.length < 2 || k.length > 180) return false;
  if (/^\d+$/.test(k)) return false;
  if (/[,{}()[\]"'`]/.test(k)) return false;
  if (/\s/.test(k)) return false;
  if (/\$\{/.test(k)) return false;
  if (/^(true|false|null|undefined|return|function|object|number|string|boolean)$/i.test(k)) return false;
  if (/^(GET|POST|PUT|PATCH|DELETE|http|https|load|click|error|message|open|close|firefox|chrome|safari|edge|before|after|test|prod|dev|development|production|cookie|autoincrement|keypath|border-box|content-box|animation)$/.test(k)) return false;
  if (isDomain(k)) return false;
  if (/^[#.[<{]/.test(k)) return false;
  if (/^\/\//.test(k) || /^https?:\/\//i.test(k) || /^wss?:\/\//i.test(k)) return false;
  if (/\.(png|jpe?g|gif|svg|css|mjs?|html?|woff2?|ttf|map)$/i.test(k)) return false;
  return true;
}

function firstTopLevelArgument(snippet) {
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let i = 0; i < snippet.length; i++) {
    const ch = snippet[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) return snippet.slice(0, i);
  }
  return snippet;
}

function storageContextScore(key, context) {
  let score = 0;
  const text = `${key || ''} ${context || ''}`;
  if (/(chrome|browser)\.storage|localStorage|sessionStorage|indexedDB|caches\.|chrome\.cookies|browser\.cookies/i.test(text)) score += 4;
  if (/\b(storage|store|stored|storing|persist|persistent|cache|cached|prefs?|preferences?|settings?|state|session|cookie|indexeddb|database|objectStore|local|sync|managed)\b/i.test(text)) score += 2;
  if (/\b(auth|token|jwt|session|sid|user|uid|profile|account|email|identity|device|client|machine|distinct|install|setting|pref|flag|experiment|abtest|config|consent|privacy|telemetry|analytics|tracking|history|coupon|cart)\b/i.test(text)) score += 2;
  if (/^[A-Z0-9_]{3,}$/.test(key) || /^[a-z][A-Za-z0-9]*(Key|Storage|Store|Token|Session|Setting|Config|Cache|Id|ID)$/.test(key)) score += 1;
  return score;
}

function addStorageCandidate(buckets, row) {
  const key = normalizeStorageKey(row.key);
  if (!looksLikeUsefulStorageKey(key)) return;
  addUnique(buckets.storage, `${key}|${row.type}|${row.operation}|${row.file}|${row.line_start}`, {
    ...row,
    key,
    confidence: row.confidence || 'low'
  });
}

function findMatchingParen(text, openIndex) {
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function getCallArgument(text, openIndex, maxLen = 1400) {
  const end = findMatchingParen(text, openIndex);
  if (end < 0 || end - openIndex > maxLen) return '';
  return text.slice(openIndex + 1, end);
}

function buildStringBindings(text) {
  const bindings = new Map();
  const add = (name, value) => {
    const key = normalizeStorageKey(value);
    if (looksLikeUsefulStorageKey(key)) bindings.set(name, key);
  };
  let m;
  const assignRe = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*['"`]([^'"`]{1,180})['"`]/g;
  while ((m = assignRe.exec(text))) add(m[1], m[2]);

  const enumPropRe = /\b([A-Z][A-Z0-9_$]{2,}|[A-Za-z_$][\w$]*(?:KEY|Key|TOKEN|Token|SETTING|Setting|STORAGE|Storage|CACHE|Cache|ID|Id))\s*[:=]\s*['"`]([^'"`]{1,180})['"`]/g;
  while ((m = enumPropRe.exec(text))) add(m[1], m[2]);
  return bindings;
}

function resolveIdentifierKey(token, bindings) {
  const clean = String(token || '').trim().replace(/^[({\[]+|[)}\].,;]+$/g, '');
  if (!clean) return '';
  if (/^['"`]/.test(clean)) return clean.replace(/^['"`]|['"`]$/g, '');
  if (bindings.has(clean)) return bindings.get(clean);
  const prop = clean.match(/\.([A-Za-z_$][\w$]*)$/);
  if (prop && !/^(name|key|id|type|value|url|domain|path|options?)$/i.test(prop[1]) && bindings.has(prop[1])) return bindings.get(prop[1]);
  if (/^[A-Za-z_$][\w$]*(?:Key|KEY|Token|TOKEN|Session|SESSION|Setting|SETTING|Storage|STORAGE|Cache|CACHE|Id|ID)$/.test(clean)) return clean;
  return '';
}

function extractKeysFromSnippet(snippet, bindings = new Map()) {
  const keys = new Set();
  let m;
  const strRe = /['"`]([^'"`]{1,180})['"`]/g;
  while ((m = strRe.exec(snippet))) {
    if (looksLikeUsefulStorageKey(m[1])) keys.add(m[1]);
  }
  const computedPropRe = /\[\s*['"`]([^'"`]{1,180})['"`]\s*\]\s*:/g;
  while ((m = computedPropRe.exec(snippet))) {
    if (looksLikeUsefulStorageKey(m[1])) keys.add(m[1]);
  }
  const propRe = /(?:^|[,{]\s*)([A-Za-z_$][\w$-]*)\s*:/g;
  while ((m = propRe.exec(snippet))) {
    if (looksLikeUsefulStorageKey(m[1])) keys.add(m[1]);
  }
  const destructuringRe = /\{\s*([^{}]{1,300})\s*\}\s*=\s*(?:await\s*)?(?:chrome|browser)\.storage\./g;
  while ((m = destructuringRe.exec(snippet))) {
    for (const part of m[1].split(',')) {
      const key = part.split(':')[0].trim();
      if (looksLikeUsefulStorageKey(key)) keys.add(key);
    }
  }
  const arrayIdentRe = /\[\s*([A-Za-z_$][\w$]*(?:\s*,\s*[A-Za-z_$][\w$]*){0,40})\s*\]/g;
  while ((m = arrayIdentRe.exec(snippet))) {
    for (const ident of m[1].split(/\s*,\s*/)) {
      const resolved = resolveIdentifierKey(ident, bindings);
      if (looksLikeUsefulStorageKey(resolved)) keys.add(resolved);
    }
  }
  const singleIdent = resolveIdentifierKey(snippet, bindings);
  if (looksLikeUsefulStorageKey(singleIdent)) keys.add(singleIdent);
  return Array.from(keys).filter((k) => !/^(true|false|null|undefined)$/.test(k)).slice(0, 80);
}

function extractStringLiterals(text) {
  const out = [];
  const maxLen = 1000;
  for (let i = 0; i < text.length; i++) {
    const quote = text[i];
    if (quote !== '"' && quote !== "'" && quote !== '`') continue;
    const start = i;
    let value = '';
    let escaped = false;
    let closed = false;
    for (i = i + 1; i < text.length; i++) {
      const ch = text[i];
      if (escaped) {
        if (value.length < maxLen) value += ch;
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        if (value.length < maxLen) value += ch;
        continue;
      }
      if (ch === quote) {
        closed = true;
        break;
      }
      if (value.length < maxLen) value += ch;
    }
    if (!closed || !value || value.length >= maxLen) continue;
    out.push({ value, index: start });
  }
  return out;
}

function parseManifestHints() {
  const manifestPath = path.join(extensionDir, 'manifest.json');
  const manifest = readJson(manifestPath) || {};
  const domains = new Set();
  const manifestEndpoints = new Map();

  const addDomainFromPattern = (pattern) => {
    if (!pattern || typeof pattern !== 'string') return;
    const cleaned = pattern
      .replace(/^\*:\/\//, '')
      .replace(/^https?:\/\//, '')
      .replace(/^wss?:\/\//, '')
      .replace(/^\*\./, '')
      .replace(/\/.*$/, '')
      .replace(/:\d+$/, '')
      .trim();
    if (isDomain(cleaned) && cleaned !== '*') domains.add(cleaned);
  };

  const addManifestEndpoint = (value, sourceHint, confidence = 'medium') => {
    if (!value || typeof value !== 'string') return;
    const cleaned = value.replace(/['",;]+$/g, '').trim();
    if (!/^https?:\/\//i.test(cleaned) && !/^wss?:\/\//i.test(cleaned)) return;
    try {
      const host = new URL(cleaned).hostname;
      if (isDomain(host)) domains.add(host);
    } catch {}
    if (!manifestEndpoints.has(cleaned)) {
      manifestEndpoints.set(cleaned, {
        value: cleaned,
        kind: 'manifest_endpoint',
        method: 'UNKNOWN',
        confidence,
        file: 'manifest.json',
        line_start: 1,
        line_end: 1,
        context: sourceHint,
        source_hint: sourceHint
      });
    }
  };

  for (const p of manifest.host_permissions || []) addDomainFromPattern(p);
  for (const p of manifest.optional_host_permissions || []) addDomainFromPattern(p);
  for (const cs of manifest.content_scripts || []) for (const p of cs.matches || []) addDomainFromPattern(p);

  const csp = manifest.content_security_policy;
  const cspText = typeof csp === 'string' ? csp : (csp && Object.values(csp).join('; ')) || '';
  const fullUrlRe = /\b(?:https?|wss?):\/\/[^\s'",;)]+/gi;
  let m;
  while ((m = fullUrlRe.exec(cspText))) {
    const sourceHint = /report-uri/i.test(cspText.slice(Math.max(0, m.index - 60), m.index + 120))
      ? 'manifest_csp_report_uri'
      : 'manifest_csp';
    addManifestEndpoint(m[0], sourceHint, sourceHint === 'manifest_csp_report_uri' ? 'high' : 'medium');
  }
  for (const token of cspText.split(/\s+/)) addDomainFromPattern(token.replace(/[;'",]/g, ''));

  return {
    manifest,
    domains: Array.from(domains).sort(),
    manifestEndpoints: Array.from(manifestEndpoints.values())
  };
}

function isDomain(s) {
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s) && !/\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|html)$/i.test(s);
}

function looksLikeRoute(s) {
  if (!/^\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]{2,}$/.test(s)) return false;
  if (/^\/\//.test(s)) return false;
  if (/\.(png|jpg|jpeg|gif|svg|css|js|mjs|html|woff2?|ttf|map)$/i.test(s)) return false;
  if (/^\/(div|span|body|html|head|button|input|svg|path)(\b|[.#\[])/i.test(s)) return false;
  return /(api|v\d+|oauth|auth|login|user|profile|track|event|metric|log|batch|import|config|sync|graphql|rpc|message|coupon|cart|checkout|telemetry|crash|collect|beacon|token|userinfo|session|document|text|editor|gateway|gate|gates|treatment|trial|signin|signup|subscribe|plans|special-offers|upgrade|defs|dictionary)/i.test(s);
}

function detectMethod(context) {
  const m = context.match(/method\s*[:=]\s*['"`]([A-Z]+)['"`]/i) || context.match(/\b(GET|POST|PUT|PATCH|DELETE)\b/);
  if (m) return m[1].toUpperCase();
  if (/WebSocket|new\s+WebSocket|wss?:\/\//i.test(context)) return 'WEBSOCKET';
  if (/sendBeacon/i.test(context)) return 'POST';
  return 'UNKNOWN';
}

function confidenceFor(kind, context) {
  if (/fetch|XMLHttpRequest|sendBeacon|WebSocket|axios|\.request\(|\.post\(|\.get\(|graphql|transport|endpoint|url/i.test(context)) return kind === 'route' ? 'medium' : 'high';
  return kind === 'full_url' ? 'medium' : 'low';
}

function routeDomainHints(route, domains) {
  const r = route.toLowerCase();
  const filtered = domains.filter((d) => {
    const x = d.toLowerCase();
    if (/auth|oauth|token|userinfo|login|session|revoke/.test(r)) return /auth|account|login|identity|user/.test(x);
    if (/gates?\/|\/gates?|gate/.test(r)) return /gate/.test(x);
    if (/treatment|experiment|variant/.test(r)) return /treatment|experiment|config|flag/.test(x);
    if (/\/api\/defs|dictionary|definition/.test(r)) return /api|dictionary|defs|definition/.test(x);
    if (/log|metric|track|telemetry|event|beacon|crash|collect|batch|import/.test(r)) return /metric|log|track|telemetry|analytics|mixpanel|iterable|segment|amplitude|sentry|datadog|stats|observability|monitoring/.test(x);
    if (/config|feature|flag|dynamic|page_config/.test(r)) return /config|cms|feature|experiment|cdn|assets/.test(x);
    if (/document|text|editor|draft|check|suggest|rewrite|assist|ai|gateway|graphql|completion|model|inference|nlp/.test(r)) return /api|gateway|graphql|ai|ml|model|inference|nlp|text|editor|assistant|service|backend/.test(x);
    return false;
  });
  return filtered.slice(0, 12);
}

function categorizeString(value) {
  if (/^https?:\/\//i.test(value) || /^wss?:\/\//i.test(value)) return 'full_url';
  if (isDomain(value)) return 'domain';
  if (looksLikeRoute(value)) return 'relative_route';
  if (/^(chrome|browser)\./.test(value)) return 'browser_api_string';
  if (/^[A-Za-z0-9_.:-]{3,80}$/.test(value) && /(token|auth|session|user|id|key|cache|config|setting|pref|flag|experiment|message|event|track|telemetry|coupon|cart)/i.test(value)) return 'suspicious_key_or_event';
  return null;
}


function addEndpointCandidate(buckets, key, row) {
  const valueKey = String(row && row.value ? row.value : key).trim().toLowerCase();
  addUnique(buckets.endpoints, `endpoint|${valueKey}`, row);
}

function uniqueDomains(manifestHints) {
  manifestHints.domains = Array.from(new Set(manifestHints.domains)).filter(Boolean).sort();
  return manifestHints.domains;
}

function addRouteWithDomainHints(route, rel, line, context, manifestHints, buckets, sourceHint, confidence = 'low') {
  if (!looksLikeRoute(route)) return;
  addEndpointCandidate(buckets, `${sourceHint}|route|${route}|${rel}|${line}`, {
    value: route,
    kind: sourceHint === 'template_route' ? 'template_route' : 'relative_route',
    method: detectMethod(context),
    confidence: confidenceFor('route', context),
    file: rel,
    line_start: line,
    line_end: line,
    context,
    source_hint: sourceHint
  });
  for (const domain of routeDomainHints(route, uniqueDomains(manifestHints))) {
    const scheme = /websocket|socket|ws/i.test(context) ? 'wss' : 'https';
    addEndpointCandidate(buckets, `${sourceHint}|synth|${scheme}://${domain}${route}|${rel}|${line}`, {
      value: `${scheme}://${domain}${route}`,
      kind: 'synthesized_endpoint',
      method: detectMethod(context),
      confidence,
      file: rel,
      line_start: line,
      line_end: line,
      context,
      source_hint: `${sourceHint}_plus_domain:${domain}`
    });
  }
}

function expandPlaceholderUrl(value, rel, line, context, manifestHints, buckets, sourceHint = 'env_placeholder_expansion') {
  if (!/\$\{[^}]+\}/.test(value) || !/^(https?|wss?):\/\//i.test(value)) return;
  const m = value.match(/^(https?|wss?):\/\/([^/]*?)\$\{[^}]+\}([^/]*)(\/.*)?$/i);
  if (!m) return;
  const scheme = m[1].toLowerCase();
  const prefix = (m[2] || '').replace(/\.$/, '').toLowerCase();
  const suffix = (m[3] || '').replace(/^\./, '').toLowerCase();
  const route = m[4] || '';
  const domains = uniqueDomains(manifestHints).filter((domain) => {
    const d = domain.toLowerCase();
    if (prefix && !d.startsWith(prefix + '.')) return false;
    if (suffix && !d.endsWith('.' + suffix) && d !== suffix) return false;
    return Boolean(prefix || suffix);
  });
  for (const domain of domains.slice(0, 20)) {
    const expanded = `${scheme}://${domain}${route}`;
    addEndpointCandidate(buckets, `${sourceHint}|${expanded}|${rel}|${line}`, {
      value: expanded,
      kind: 'expanded_placeholder_url',
      method: detectMethod(context),
      confidence: 'medium',
      file: rel,
      line_start: line,
      line_end: line,
      context,
      source_hint: `${sourceHint}:${value}`
    });
  }
}

function scanDynamicEndpointPatterns(text, lineStarts, rel, manifestHints, buckets) {
  let m;

  const templateRouteRe = /\$\{[^}]+\}(\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]{2,})/g;
  while ((m = templateRouteRe.exec(text))) {
    const route = m[1];
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    if (!/baseUrl|endpoint|url|fetch|request|http|log|crash|gate|treatment|api/i.test(context)) continue;
    addRouteWithDomainHints(route, rel, line, context, manifestHints, buckets, 'template_route', 'low');
  }

  const concatRouteRe = /(?:\+|=|:|return|\?|,|\()\s*['"`](\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]{2,})['"`]/g;
  while ((m = concatRouteRe.exec(text))) {
    const route = m[1];
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    if (!/baseUrl|endpoint|url|fetch|request|http|log|crash|gate|treatment|api|config/i.test(context)) continue;
    addRouteWithDomainHints(route, rel, line, context, manifestHints, buckets, 'concat_route', 'low');
  }

  const placeholderUrlRe = /\b(?:https?|wss?):\/\/[^\s'"<>)\],;]*\$\{[^}]+\}[^\s'"<>)\],;]*/g;
  while ((m = placeholderUrlRe.exec(text))) {
    const value = m[0].replace(/[`'")\],;]+$/g, '');
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    addEndpointCandidate(buckets, `placeholder|${value}|${rel}|${line}`, {
      value,
      kind: 'placeholder_url',
      method: detectMethod(context),
      confidence: 'low',
      file: rel,
      line_start: line,
      line_end: line,
      context,
      source_hint: 'placeholder_url_literal'
    });
    expandPlaceholderUrl(value, rel, line, context, manifestHints, buckets);
  }
}

function addManifestEndpointCandidates(manifestHints, buckets) {
  for (const ep of manifestHints.manifestEndpoints || []) {
    addEndpointCandidate(buckets, `manifest|${ep.value}`, ep);
  }
}

function scanStoragePatterns(text, lineStarts, rel, bindings, buckets) {
  let m;

  const chromeStorageRe = /\b(chrome|browser)\.storage\.(local|sync|session|managed)\.(get|set|remove|clear|getBytesInUse)\s*\(/g;
  while ((m = chromeStorageRe.exec(text))) {
    const openIndex = chromeStorageRe.lastIndex - 1;
    const arg = firstTopLevelArgument(getCallArgument(text, openIndex));
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    const type = m[2];
    const operation = m[3];
    const keys = operation === 'clear' ? ['*clear*'] : extractKeysFromSnippet(arg, bindings);
    for (const key of keys) {
      addStorageCandidate(buckets, {
        key,
        type: `chrome.storage.${type}`,
        operation,
        confidence: key === '*clear*' ? 'medium' : (storageContextScore(key, context) >= 6 ? 'high' : 'medium'),
        file: rel,
        line_start: line,
        line_end: line,
        context
      });
    }
  }

  const webStorageCallRe = /\b(?:window\.|globalThis\.)?(localStorage|sessionStorage)\.(getItem|setItem|removeItem|key|clear)\s*\(/g;
  while ((m = webStorageCallRe.exec(text))) {
    const openIndex = webStorageCallRe.lastIndex - 1;
    const arg = firstTopLevelArgument(getCallArgument(text, openIndex));
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    const type = m[1];
    const operation = m[2];
    const keys = operation === 'clear' ? ['*clear*'] : extractKeysFromSnippet(arg, bindings);
    for (const key of keys) {
      addStorageCandidate(buckets, {
        key,
        type,
        operation,
        confidence: key === '*clear*' ? 'medium' : 'high',
        file: rel,
        line_start: line,
        line_end: line,
        context
      });
    }
  }

  const webStorageBracketRe = /\b(?:window\.|globalThis\.)?(localStorage|sessionStorage)\s*\[\s*(['"`]([^'"`]{1,180})['"`]|[A-Za-z_$][\w$]*)\s*\]/g;
  while ((m = webStorageBracketRe.exec(text))) {
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    const key = m[3] || resolveIdentifierKey(m[2], bindings);
    addStorageCandidate(buckets, {
      key,
      type: m[1],
      operation: /=/.test(text.slice(m.index, Math.min(text.length, m.index + 240))) ? 'set/bracket' : 'get/bracket',
      confidence: 'medium',
      file: rel,
      line_start: line,
      line_end: line,
      context
    });
  }

  const indexedDbRe = /\bindexedDB\.(open|deleteDatabase)\s*\(\s*(['"`]([^'"`]{1,180})['"`]|[A-Za-z_$][\w$]*)/g;
  while ((m = indexedDbRe.exec(text))) {
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    const key = m[3] || resolveIdentifierKey(m[2], bindings);
    addStorageCandidate(buckets, {
      key,
      type: 'indexedDB',
      operation: m[1],
      confidence: 'high',
      file: rel,
      line_start: line,
      line_end: line,
      context
    });
  }

  const objectStoreRe = /\.(createObjectStore|deleteObjectStore|objectStore|transaction)\s*\(\s*([^)]{0,500})\)/g;
  while ((m = objectStoreRe.exec(text))) {
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    if (!/indexedDB|IDB|objectStore|transaction|database|db\./i.test(context)) continue;
    for (const key of extractKeysFromSnippet(firstTopLevelArgument(m[2]), bindings)) {
      addStorageCandidate(buckets, {
        key,
        type: 'indexedDB.objectStore',
        operation: m[1],
        confidence: 'medium',
        file: rel,
        line_start: line,
        line_end: line,
        context
      });
    }
  }

  const cacheRe = /\bcaches\.(open|delete|match|has)\s*\(\s*(['"`]([^'"`]{1,180})['"`]|[A-Za-z_$][\w$]*)/g;
  while ((m = cacheRe.exec(text))) {
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    const key = m[3] || resolveIdentifierKey(m[2], bindings);
    addStorageCandidate(buckets, {
      key,
      type: 'CacheStorage',
      operation: m[1],
      confidence: 'high',
      file: rel,
      line_start: line,
      line_end: line,
      context
    });
  }

  const cookieRe = /\b(chrome|browser)\.cookies\.(get|getAll|set|remove|getAllCookieStores|onChanged\.addListener)\s*\(/g;
  while ((m = cookieRe.exec(text))) {
    const openIndex = cookieRe.lastIndex - 1;
    const arg = getCallArgument(text, openIndex);
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    const keys = extractKeysFromSnippet(arg, bindings).filter((key) => !/^(url|domain|path|secure|httpOnly|sameSite|expirationDate|storeId)$/i.test(key));
    for (const key of keys.length ? keys : ['cookie']) {
      addStorageCandidate(buckets, {
        key,
        type: `${m[1]}.cookies`,
        operation: m[2],
        confidence: key === 'cookie' ? 'low' : 'medium',
        file: rel,
        line_start: line,
        line_end: line,
        context
      });
    }
  }

  const wrapperStorageRe = /(?:\b|\.)(get|getItem|set|setItem|put|save|remove|removeItem|delete|clear|read|write|load|update)\s*\(\s*(['"`]([^'"`]{2,180})['"`]|[A-Za-z_$][\w$]*)/g;
  while ((m = wrapperStorageRe.exec(text))) {
    const operation = m[1];
    const key = m[3] || resolveIdentifierKey(m[2], bindings);
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    const score = storageContextScore(key, context);
    if (score < 4) continue;
    addStorageCandidate(buckets, {
      key,
      type: 'custom_storage_or_cache_wrapper',
      operation,
      confidence: score >= 7 ? 'medium' : 'low',
      file: rel,
      line_start: line,
      line_end: line,
      context
    });
  }

  for (const lit of extractStringLiterals(text)) {
    const key = normalizeStorageKey(lit.value);
    if (!looksLikeUsefulStorageKey(key)) continue;
    const line = lineOfIndex(lineStarts, lit.index);
    const context = rawContext(text, lit.index);
    const score = storageContextScore(key, context);
    const explicitStorageContext = /(chrome|browser)\.storage|localStorage|sessionStorage|indexedDB|caches\.|chrome\.cookies|browser\.cookies/i.test(context);
    const keyLooksStorageLike = /(key|token|storage|store|cache|session|setting|settings|config|pref|preference|id|user|auth|cookie|indexeddb|database|consent|privacy|telemetry|analytics|install|profile|account)/i.test(key);
    if (score < 7 || (!explicitStorageContext && !keyLooksStorageLike)) continue;
    addStorageCandidate(buckets, {
      key,
      type: 'storage_key_constant',
      operation: 'constant',
      confidence: score >= 8 ? 'medium' : 'low',
      file: rel,
      line_start: line,
      line_end: line,
      context
    });
  }
}

function analyzeFile(file, manifestHints, buckets) {
  const text = fs.readFileSync(file.full, 'utf8');
  const lineStarts = buildLineStarts(text);
  const literals = extractStringLiterals(text);
  const rel = file.rel;
  const bindings = buildStringBindings(text);

  for (const lit of literals) {
    const value = String(lit.value || '').trim();
    if (!value) continue;
    const line = lineOfIndex(lineStarts, lit.index);
    const context = rawContext(text, lit.index);
    const category = categorizeString(value);
    if (category) {
      addUnique(buckets.strings, `${category}|${value}|${rel}|${line}`, {
        value, category, file: rel, line_start: line, line_end: line, context
      });
    }

    if (/^https?:\/\//i.test(value) || /^wss?:\/\//i.test(value)) {
      addEndpointCandidate(buckets, `url|${value}|${rel}|${line}`, {
        value, kind: 'full_url', method: detectMethod(context), confidence: confidenceFor('full_url', context),
        file: rel, line_start: line, line_end: line, context, source_hint: 'literal_url'
      });
      try {
        const host = new URL(value).hostname;
        if (isDomain(host)) manifestHints.domains.push(host);
      } catch {}
      expandPlaceholderUrl(value, rel, line, context, manifestHints, buckets, 'literal_placeholder_expansion');
    } else if (looksLikeRoute(value)) {
      addEndpointCandidate(buckets, `route|${value}|${rel}|${line}`, {
        value, kind: 'relative_route', method: detectMethod(context), confidence: confidenceFor('route', context),
        file: rel, line_start: line, line_end: line, context, source_hint: 'route_literal'
      });
      addRouteWithDomainHints(value, rel, line, context, manifestHints, buckets, 'route_literal', 'low');
    }
  }

  scanDynamicEndpointPatterns(text, lineStarts, rel, manifestHints, buckets);

  const chromeMsgRe = /\b(chrome|browser)\.(runtime|tabs)\.(sendMessage|onMessage\.addListener|connect|onConnect\.addListener)|\bpostMessage\s*\(|\baddEventListener\s*\(\s*['"`]message['"`]/g;
  let m;
  while ((m = chromeMsgRe.exec(text))) {
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    const api = m[0].replace(/\s+/g, ' ');
    const openIndex = text.indexOf('(', m.index);
    const arg = openIndex >= 0 && openIndex - m.index < 90 ? getCallArgument(text, openIndex, 2200) : '';
    const names = extractMessageNamesFromSnippet(`${arg} ${context}`);
    const payloadKeys = extractPayloadKeys(arg || context);
    let direction = 'unknown';
    if (/tabs\.sendMessage/.test(api)) direction = 'background->content';
    else if (/runtime\.sendMessage/.test(api)) direction = /content|inject|page/i.test(rel) ? 'content->background' : 'unknown';
    else if (/postMessage/.test(api)) direction = 'window.postMessage';
    else if (/onMessage|addEventListener/.test(api)) direction = 'handler';
    const finalNames = names.length ? names : [api];
    for (const name of finalNames) {
      addMessageCandidate(buckets, {
        channel_name: name,
        direction,
        api,
        confidence: names.length ? 'medium' : 'low',
        payload_keys: payloadKeys,
        file: rel,
        line_start: line,
        line_end: line,
        context
      });
    }
  }

  const busRe = /(?:\.|\b)(emit|on|once|send|request|publish|subscribe|dispatch|trigger|call|handle|register|addHandler|addListener)\s*\(\s*['"`]([^'"`]{2,160})['"`]/g;
  while ((m = busRe.exec(text))) {
    const method = m[1];
    const name = m[2];
    if (/^(GET|POST|PUT|DELETE|PATCH|http|https|div|span|click|load|error|message)$/i.test(name)) continue;
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    const isLikelyBus = /rpc|message|bus|port|channel|transport|client|server|bridge|iframe|background|content|event|handler|command/i.test(context + ' ' + name);
    if (!isLikelyBus) continue;
    addMessageCandidate(buckets, {
      channel_name: name, direction: 'custom_or_rpc', api: method, confidence: 'medium',
      payload_keys: extractPayloadKeys(context), file: rel, line_start: line, line_end: line, context
    });
  }

  const branchRe = /\b(?:case\s+['"`]([^'"`]{2,180})['"`]\s*:|(?:type|message|event|eventName|action|command|cmd|method|channel|topic)\b[^=!<>]{0,40}(?:===|==|=)\s*['"`]([^'"`]{2,180})['"`])/g;
  while ((m = branchRe.exec(text))) {
    const name = m[1] || m[2];
    if (!looksLikeUsefulMessageName(name)) continue;
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    if (!/message|postMessage|sendMessage|onMessage|runtime|tabs|port|connect|dispatch|handler|event|request|response|command|action|payload|data/i.test(context)) continue;
    addMessageCandidate(buckets, {
      channel_name: name,
      direction: /onMessage|addEventListener|handler|case|switch/i.test(context) ? 'handler_branch' : 'unknown',
      api: 'message_type_branch',
      confidence: 'medium',
      payload_keys: extractPayloadKeys(context),
      file: rel,
      line_start: line,
      line_end: line,
      context
    });
  }

  const objectPayloadRe = /\{\s*(?:[^{}]|\{[^{}]*\}){0,1200}\b(?:type|message|event|eventName|action|command|cmd|method|channel|topic)\s*:\s*['"`][^'"`]{2,180}['"`](?:[^{}]|\{[^{}]*\}){0,1200}\}/g;
  while ((m = objectPayloadRe.exec(text))) {
    const names = extractMessageNamesFromSnippet(m[0]);
    if (!names.length) continue;
    const line = lineOfIndex(lineStarts, m.index);
    const context = rawContext(text, m.index);
    if (!/postMessage|sendMessage|runtime|tabs|port|connect|dispatch|emit|publish|request|response|message|iframe|background|content/i.test(context)) continue;
    for (const name of names) {
      addMessageCandidate(buckets, {
        channel_name: name,
        direction: /postMessage/i.test(context) ? 'window.postMessage' : (/runtime\.sendMessage/i.test(context) ? 'runtime_message' : 'custom_or_rpc'),
        api: 'object_payload_type',
        confidence: 'medium',
        payload_keys: extractPayloadKeys(m[0]),
        file: rel,
        line_start: line,
        line_end: line,
        context
      });
    }
  }

  scanStoragePatterns(text, lineStarts, rel, bindings, buckets);
}

function main() {
  if (!fs.existsSync(extensionDir)) {
    console.error(`[census] extension directory not found: ${extensionDir}`);
    process.exit(2);
  }
  ensureDir(censusDir);
  const manifestHints = parseManifestHints();
  manifestHints.domains = Array.from(new Set(manifestHints.domains));
  const buckets = { endpoints: new Map(), messages: new Map(), storage: new Map(), strings: new Map() };
  addManifestEndpointCandidates(manifestHints, buckets);
  const files = walk(extensionDir);
  for (const file of files) {
    try { analyzeFile(file, manifestHints, buckets); }
    catch (err) { console.error(`[census] failed ${file.rel}: ${err.message}`); }
  }
  const endpoints = Array.from(buckets.endpoints.values()).sort((a, b) => a.file.localeCompare(b.file) || a.line_start - b.line_start);
  const messages = Array.from(buckets.messages.values()).sort((a, b) => a.file.localeCompare(b.file) || a.line_start - b.line_start);
  const storage = Array.from(buckets.storage.values()).sort((a, b) => a.file.localeCompare(b.file) || a.line_start - b.line_start);
  const strings = Array.from(buckets.strings.values()).sort((a, b) => a.file.localeCompare(b.file) || a.line_start - b.line_start);

  writeCsv(path.join(censusDir, 'endpoints_candidates.csv'), endpoints, ['value','kind','method','confidence','file','line_start','line_end','context','source_hint']);
  writeCsv(path.join(censusDir, 'message_candidates.csv'), messages, ['channel_name','direction','api','confidence','payload_keys','file','line_start','line_end','context']);
  writeCsv(path.join(censusDir, 'storage_candidates.csv'), storage, ['key','type','operation','confidence','file','line_start','line_end','context']);
  writeCsv(path.join(censusDir, 'string_constants.csv'), strings, ['value','category','file','line_start','line_end','context']);
  fs.writeFileSync(path.join(censusDir, 'census_summary.json'), JSON.stringify({
    extension_dir: extensionDir,
    files_scanned: files.length,
    manifest_domains: Array.from(new Set(manifestHints.domains)).sort(),
    endpoints_candidates: endpoints.length,
    message_candidates: messages.length,
    storage_candidates: storage.length,
    string_constants: strings.length,
    generated_at: new Date().toISOString()
  }, null, 2), 'utf8');
  console.log(`[census] files=${files.length} endpoints=${endpoints.length} messages=${messages.length} storage=${storage.length} strings=${strings.length}`);
}

main();
