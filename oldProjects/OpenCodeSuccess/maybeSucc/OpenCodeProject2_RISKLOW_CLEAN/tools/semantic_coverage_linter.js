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

function countOutlineRows(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
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
const semanticRows = csvRows(semantic);
const dataRows = semanticRows.length > 0 ? semanticRows.slice(1) : [];

const errors = [];
const warnings = [];

if (!exists(notesPath)) errors.push("missing analysis_notes.md");
if (!exists(outlinePath)) errors.push("missing outline.jsonl");
if (!exists(semanticPath)) errors.push("missing census/semantic_architecture_review.csv");

if (exists(notesPath) && notes.length < 5000 && !hasBlocker()) {
  errors.push(
    `analysis_notes.md is too small (${notes.length} bytes); chunk-by-chunk semantic analysis likely did not run`
  );
}

if (exists(outlinePath) && countOutlineRows(outline) < 5 && !hasBlocker()) {
  errors.push(
    `outline.jsonl has too few entries (${countOutlineRows(outline)}); expected one entry per analyzed chunk`
  );
}

if (exists(semanticPath) && dataRows.length < 5 && !hasBlocker()) {
  errors.push(
    `semantic_architecture_review.csv has too few findings (${dataRows.length}); privacy/risk analysis needs semantic architecture signals`
  );
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
