#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const outDir = process.argv[2];
const extensionDir = process.argv[3] || "./extension";

if (!outDir) {
  console.error("Usage: node tools/high_signal_review_linter.js OUT_DIR [extension_dir]");
  process.exit(2);
}

const censusDir = path.join(outDir, "census");
const highSignalPath = path.join(censusDir, "high_signal_chunks.csv");
const reviewPath = path.join(censusDir, "high_signal_chunk_review.csv");
const evidenceReviewPath = path.join(censusDir, "privacy_risk_evidence_review.csv");
const summaryPath = path.join(outDir, "extension_summary.json");

const failures = [];
const warnings = [];

function exists(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

function read(file) {
  return exists(file) ? fs.readFileSync(file, "utf8") : "";
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
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

function normPath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^extension\//, "")
    .replace(/^\.\//, "");
}

function reviewMatchesChunk(review, chunk) {
  return (
    normPath(review.file) === normPath(chunk.file) &&
    Number(review.start_line) === Number(chunk.start_line) &&
    Number(review.end_line) === Number(chunk.end_line)
  );
}

function isYes(value) {
  return /^(yes|true|1|manual_reviewed|reviewed)$/i.test(String(value || "").trim());
}

function evidenceName(row) {
  return String(row.item_name || row.claim_name || row.name || row.data_name || row.type || "").toLowerCase();
}

function summaryNames() {
  if (!exists(summaryPath)) return { privacy: [], risks: [] };
  const summary = JSON.parse(read(summaryPath));
  const privacy = (((summary || {}).observed_privacy_data || {}).items || []).map((item) =>
    String(item.data_name || item.name || "").toLowerCase()
  );
  const risks = ((summary || {}).risks || []).map((risk) =>
    [
      risk.name,
      risk.type,
      risk.type_description,
      risk.description,
      risk.justification,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
  );
  return { privacy, risks };
}

function fileText(evidenceFile) {
  const rel = normPath(evidenceFile);
  const candidates = [
    path.join(extensionDir, rel),
    path.join(extensionDir, evidenceFile || ""),
    path.join(extensionDir, rel.replace(/^src\//, "src/")),
  ];
  for (const candidate of candidates) {
    if (exists(candidate)) return { file: candidate, text: read(candidate) };
  }
  return { file: candidates[0], text: "" };
}

function unbeautifiedPath(value) {
  return normPath(value).replace(/\.beautified(\.m?js|\.cjs)$/i, "$1");
}

function evidenceTrace(row) {
  const finalFile = row.evidence_file || row.beautified_evidence_file || row.file || "";
  const finalStart = Number(row.precise_start || row.beautified_start || row.evidence_start || row.draft_start || row.start || row.start_line || 0);
  const finalEnd = Number(row.precise_end || row.beautified_end || row.evidence_end || row.draft_end || row.end || row.end_line || 0);
  const originalFile = row.original_evidence_file || row.original_file || row.source_file || "";
  const originalStart = Number(row.original_start || row.original_evidence_start || row.source_start || row.draft_start || 0);
  const originalEnd = Number(row.original_end || row.original_evidence_end || row.source_end || row.draft_end || 0);
  const mapFile = originalFile || unbeautifiedPath(finalFile);
  const mapStart = originalStart || finalStart;
  const mapEnd = originalEnd || finalEnd;
  return {
    finalFile,
    finalStart,
    finalEnd,
    mapFile,
    mapStart,
    mapEnd,
    hasExplicitOriginal: Boolean(originalFile && originalStart && originalEnd),
  };
}

function anchorParts(anchor) {
  return String(anchor || "")
    .split("|")
    .flatMap((part) => part.split(/\s+OR\s+/i))
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/\.\.\./g, "").trim())
    .filter((part) => part.length >= 3);
}

function anchorFound(anchor, text) {
  const parts = anchorParts(anchor);
  if (!parts.length) return false;
  return parts.some((part) => text.includes(part));
}

function tokens(value) {
  const stop = new Set(["risk", "data", "user", "users", "with", "from", "that", "this", "and", "the", "for"]);
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !stop.has(token));
}

function namesOverlap(a, b) {
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));
  let hits = 0;
  for (const token of left) {
    if (right.has(token)) hits += 1;
    if (hits >= 1 && (token.includes("exfil") || token.includes("tracking") || token.includes("storage") || token.includes("permission") || token.includes("remote") || token.includes("fingerprint"))) return true;
    if (hits >= 2) return true;
  }
  return false;
}

if (!exists(highSignalPath)) failures.push("Missing census/high_signal_chunks.csv. Run tools/high_signal_chunks.js before privacy/risk synthesis.");
if (!exists(reviewPath)) failures.push("Missing census/high_signal_chunk_review.csv. Manually review high-signal chunks before finalizing risks/privacy.");
if (!exists(evidenceReviewPath)) failures.push("Missing census/privacy_risk_evidence_review.csv.");

const highRows = exists(highSignalPath) ? parseCsv(read(highSignalPath)) : [];
const reviewRows = exists(reviewPath) ? parseCsv(read(reviewPath)) : [];
const evidenceRows = exists(evidenceReviewPath) ? parseCsv(read(evidenceReviewPath)) : [];

for (const chunk of highRows.filter((row) => /^yes$/i.test(row.manual_review_required || ""))) {
  const match = reviewRows.find((review) => reviewMatchesChunk(review, chunk));
  if (!match) {
    failures.push(`High-signal chunk lacks manual review: ${chunk.file}:${chunk.start_line}-${chunk.end_line}`);
    continue;
  }
  if (!isYes(match.manual_reviewed)) {
    failures.push(`High-signal chunk review is not marked manual_reviewed=yes: ${chunk.file}:${chunk.start_line}-${chunk.end_line}`);
  }
  if (!String(match.manual_summary || match.notes || "").trim()) {
    failures.push(`High-signal chunk review lacks manual summary/notes: ${chunk.file}:${chunk.start_line}-${chunk.end_line}`);
  }
}

if (exists(summaryPath) && evidenceRows.length) {
  const names = summaryNames();
  for (const privacyName of names.privacy) {
    if (!evidenceRows.some((row) => /privacy/i.test(row.item_type || row.claim_section || "") && evidenceName(row) === privacyName)) {
      failures.push(`Final privacy item lacks privacy_risk_evidence_review row: ${privacyName}`);
    }
  }
  for (const riskName of names.risks) {
    if (!evidenceRows.some((row) => {
      const name = evidenceName(row);
      return /risk/i.test(row.item_type || row.claim_section || "") && namesOverlap(name, riskName);
    })) {
      failures.push(`Final risk lacks privacy_risk_evidence_review row: ${riskName}`);
    }
  }
}

for (const row of evidenceRows) {
  const trace = evidenceTrace(row);
  const evidenceFile = trace.finalFile;
  const start = trace.finalStart;
  const end = trace.finalEnd;
  const anchor = row.matched_snippet_or_anchor || row.anchor || row.snippet || "";
  const source = fileText(evidenceFile);
  const rangeWidth = start && end ? end - start + 1 : 0;
  const isOneLineBundle = start === end && source.text.length > 20000;

  if (!source.text) {
    failures.push(`Evidence source file not found for ${row.item_type || "item"} ${row.item_name || ""}: ${evidenceFile}`);
    continue;
  }

  if ((rangeWidth > 80 || isOneLineBundle) && !anchor.trim()) {
    failures.push(`Broad/minified evidence lacks anchor/snippet: ${row.item_type || "item"} ${row.item_name || ""} at ${evidenceFile}:${start}-${end}`);
  }

  if (anchor.trim() && !anchorFound(anchor, source.text)) {
    failures.push(`Evidence anchor not found in claimed source file: ${row.item_type || "item"} ${row.item_name || ""} at ${evidenceFile}:${start}-${end}`);
  }

  const matchingHigh = highRows.find((chunk) => {
    if (normPath(chunk.file) !== normPath(trace.mapFile)) return false;
    const cs = Number(chunk.start_line);
    const ce = Number(chunk.end_line);
    return trace.mapStart >= cs && trace.mapEnd <= ce;
  });
  if (matchingHigh) {
    const matchingReview = reviewRows.find((review) => reviewMatchesChunk(review, matchingHigh) && isYes(review.manual_reviewed));
    if (!matchingReview) {
      failures.push(`Final privacy/risk evidence is in a high-signal chunk without confirmed manual review: ${trace.mapFile}:${trace.mapStart}-${trace.mapEnd} (final evidence ${evidenceFile}:${start}-${end})`);
    }
  } else if (/\.(m?js|cjs)$/i.test(evidenceFile)) {
    const reason = /\.beautified(\.m?js|\.cjs)$/i.test(evidenceFile) && !trace.hasExplicitOriginal
      ? " missing explicit original_evidence_file/original_start/original_end"
      : "";
    warnings.push(`Final privacy/risk JS evidence is not mapped to high_signal_chunks.csv via original trace: ${trace.mapFile}:${trace.mapStart}-${trace.mapEnd} (final evidence ${evidenceFile}:${start}-${end};${reason})`);
  }
}

if (failures.length) {
  console.error("high-signal review linter failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error("warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

if (warnings.length) {
  console.warn("high-signal review linter warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log("high-signal review linter passed");
