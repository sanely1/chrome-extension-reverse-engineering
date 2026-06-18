#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const outDir = process.argv[2];

if (!outDir) {
  console.error("Usage: node tools/semantic_coverage_linter.js OUT_DIR");
  process.exit(2);
}

const notesPath = path.join(outDir, "analysis_notes.md");
const outlinePath = path.join(outDir, "outline.jsonl");
const semanticPath = path.join(outDir, "census", "semantic_architecture_review.csv");
const chunksPath = path.join(outDir, "census", "source_chunks.csv");
const highSignalPath = path.join(outDir, "census", "high_signal_chunks.csv");
const highSignalReviewPath = path.join(outDir, "census", "high_signal_chunk_review.csv");
const scanLogPath = path.join(outDir, "scan_log.txt");

function exists(p) {
  return fs.existsSync(p) && fs.statSync(p).isFile();
}

function read(p) {
  return exists(p) ? fs.readFileSync(p, "utf8") : "";
}

function csvRows(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  const rows = csvRows(text);
  if (!rows.length) return [];
  const headers = parseCsvLine(rows[0]);
  return rows.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });
}

function parseOutline(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function outlineMatchesChunk(entry, chunk) {
  const entryFile = String(entry.file || "").replace(/\\/g, "/");
  const chunkFile = String(chunk.file || "").replace(/\\/g, "/");
  const entryChunk = entry.chunk || {};
  const start = Number(entryChunk.start_line ?? entryChunk.start ?? entry.start_line);
  const end = Number(entryChunk.end_line ?? entryChunk.end ?? entry.end_line);
  return (
    entryFile === chunkFile &&
    start === Number(chunk.start_line) &&
    end === Number(chunk.end_line)
  );
}

function reviewMatchesChunk(review, chunk) {
  const reviewFile = String(review.file || "").replace(/\\/g, "/");
  const chunkFile = String(chunk.file || "").replace(/\\/g, "/");
  return (
    reviewFile === chunkFile &&
    Number(review.start_line) === Number(chunk.start_line) &&
    Number(review.end_line) === Number(chunk.end_line)
  );
}

function isManualReviewed(row) {
  return /^(yes|true|1|manual_reviewed|reviewed)$/i.test(String(row.manual_reviewed || "").trim());
}

function hasBlocker() {
  const log = read(scanLogPath).toLowerCase();
  return (
    log.includes("semantic architecture review skipped") ||
    log.includes("semantic architecture review blocked") ||
    log.includes("chunk analysis blocked")
  );
}

const notes = read(notesPath);
const outline = read(outlinePath);
const semantic = read(semanticPath);
const chunks = parseCsv(read(chunksPath));
const highSignalChunks = parseCsv(read(highSignalPath));
const highSignalReviews = parseCsv(read(highSignalReviewPath));
const outlineEntries = parseOutline(outline);
const semanticRows = csvRows(semantic);
const dataRows = semanticRows.length > 0 ? semanticRows.slice(1) : [];

const errors = [];
const warnings = [];

if (!exists(notesPath)) errors.push("missing analysis_notes.md");
if (!exists(outlinePath)) errors.push("missing outline.jsonl");
if (!exists(semanticPath)) errors.push("missing census/semantic_architecture_review.csv");
if (!exists(chunksPath) && !hasBlocker()) errors.push("missing census/source_chunks.csv");
if (!exists(highSignalPath) && !hasBlocker()) errors.push("missing census/high_signal_chunks.csv");
if (!exists(highSignalReviewPath) && !hasBlocker()) errors.push("missing census/high_signal_chunk_review.csv");

if (exists(chunksPath) && chunks.length === 0 && !hasBlocker()) {
  errors.push("census/source_chunks.csv has no chunk rows; source coverage cannot be verified");
}

if (exists(highSignalPath) && exists(highSignalReviewPath) && !hasBlocker()) {
  const requiredHighSignal = highSignalChunks.filter((chunk) => /^yes$/i.test(chunk.manual_review_required || ""));
  const missingReviews = requiredHighSignal.filter(
    (chunk) => !highSignalReviews.some((review) => reviewMatchesChunk(review, chunk) && isManualReviewed(review))
  );
  if (missingReviews.length) {
    const examples = missingReviews
      .slice(0, 10)
      .map((chunk) => `${chunk.file}:${chunk.start_line}-${chunk.end_line}`)
      .join(", ");
    errors.push(
      `high_signal_chunk_review.csv is missing ${missingReviews.length} manual review row(s) required by high_signal_chunks.csv; examples: ${examples}`
    );
  }
}

if (exists(highSignalReviewPath) && exists(outlinePath) && !hasBlocker()) {
  const reviewedRows = highSignalReviews.filter(isManualReviewed);
  const missingOutline = reviewedRows.filter(
    (review) => !outlineEntries.some((entry) => outlineMatchesChunk(entry, review))
  );
  if (missingOutline.length) {
    const examples = missingOutline
      .slice(0, 10)
      .map((chunk) => `${chunk.file}:${chunk.start_line}-${chunk.end_line}`)
      .join(", ");
    errors.push(
      `outline.jsonl is missing ${missingOutline.length} manually reviewed high-signal chunk entr(ies); examples: ${examples}`
    );
  }
}

if (exists(semanticPath) && dataRows.length === 0 && !hasBlocker()) {
  warnings.push("semantic_architecture_review.csv has no data rows; verify that no architecture-level behaviors were present");
}

const requiredFamilies = [
  "text_capture",
  "auth_tokens",
  "telemetry_tracking",
  "storage_persistence",
  "remote_config",
  "messaging_rpc",
];

const lowerSemantic = semantic.toLowerCase();
for (const family of requiredFamilies) {
  if (!lowerSemantic.includes(family)) {
    warnings.push(`semantic review does not mention family: ${family}`);
  }
}

if (errors.length) {
  console.error("semantic coverage linter failed:");
  for (const error of errors) console.error(`- ${error}`);
  if (warnings.length) {
    console.error("warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

if (warnings.length) {
  console.warn("semantic coverage linter warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log("semantic coverage linter passed");
