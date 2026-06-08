#!/usr/bin/env node
/*
 * Message review linter.
 *
 * Usage:
 *   node tools/message_review_linter.js OUT_DIR
 *
 * The linter checks that message_candidate_review.csv exists and that final
 * extension_summary.json does not include obvious fake message channels.
 */
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(process.cwd(), process.argv[2] || './out_census');
const summaryPath = path.join(outDir, 'extension_summary.json');
const reviewPath = path.join(outDir, 'census', 'message_candidate_review.csv');

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
  return body.filter((r) => r.some(Boolean)).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] || ''])));
}

function channelName(row) {
  return String(row.name || row.channel_name || '').trim();
}

function fakeReason(name) {
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
  const failures = [];

  if (!fs.existsSync(reviewPath)) {
    failures.push(`Missing required message adjudication file: ${reviewPath}`);
  } else {
    const review = parseCsv(fs.readFileSync(reviewPath, 'utf8'));
    const badDecisions = review.filter((r) => !/^(confirmed_message_channel|likely_message_channel|rejected_candidate|uncertain_candidate)$/.test(r.decision || ''));
    if (badDecisions.length) failures.push(`message_candidate_review.csv has ${badDecisions.length} row(s) with invalid decision values`);
  }

  if (!fs.existsSync(summaryPath)) {
    failures.push(`Missing extension_summary.json: ${summaryPath}`);
  } else {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    const channels = summary.messaging && Array.isArray(summary.messaging.channels) ? summary.messaging.channels : [];
    const bad = [];
    for (const row of channels) {
      const name = channelName(row);
      const reason = fakeReason(name);
      if (reason) bad.push({ name, reason });
    }
    if (bad.length) {
      failures.push(`Final messaging.channels contains ${bad.length} obvious fake channel(s): ${bad.slice(0, 30).map((b) => `${b.name} (${b.reason})`).join('; ')}`);
    }
  }

  if (failures.length) {
    console.error('[message-review-linter] FAIL');
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }
  console.log('[message-review-linter] OK');
}

main();
