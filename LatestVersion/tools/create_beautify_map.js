#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const OUT_DIR = process.argv[2];
const EXT_DIR = process.argv[3] || "./extension";

if (!OUT_DIR) {
  console.error("Usage: node tools/create_beautify_map.js OUT_DIR [extension_dir]");
  process.exit(2);
}

const outDir = path.resolve(OUT_DIR);
const extDir = path.resolve(EXT_DIR);
const censusDir = path.join(outDir, "census");

function posix(p) {
  return p.split(path.sep).join("/");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...body] = rows.filter((r) => r.some((v) => v !== ""));
  if (!headers) return [];
  return body.map((values) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });
    return obj;
  });
}

function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  return parseCsv(fs.readFileSync(file, "utf8"));
}

function isSourceFile(file) {
  return /\.(m?js|cjs)$/i.test(file) && !/beautified/i.test(file) && !/\.map$/i.test(file);
}

function toExtensionRelative(file) {
  if (!file) return "";
  return String(file)
    .replace(/\\/g, "/")
    .replace(/^extension\//, "")
    .replace(/^\/+/, "");
}

function safeFullPath(relFile) {
  const clean = toExtensionRelative(relFile);
  if (!isSourceFile(clean)) return null;
  const full = path.resolve(extDir, clean);
  if (!full.startsWith(extDir + path.sep) && full !== extDir) return null;
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return null;
  return full;
}

function addCandidate(candidates, file, reason) {
  const full = safeFullPath(file);
  if (!full) return;
  const rel = posix(path.relative(extDir, full));
  if (!candidates.has(rel)) candidates.set(rel, new Set());
  candidates.get(rel).add(reason);
}

function loadCandidates() {
  const candidates = new Map();

  for (const row of readCsv(path.join(censusDir, "source_file_inventory.csv"))) {
    addCandidate(candidates, row.file, `runtime inventory: ${row.role || "runtime source"}`);
  }

  for (const row of readCsv(path.join(censusDir, "high_signal_chunks.csv"))) {
    addCandidate(candidates, row.file, "high-signal chunk");
  }

  for (const row of readCsv(path.join(censusDir, "privacy_risk_evidence_review.csv"))) {
    addCandidate(candidates, row.evidence_file, `privacy/risk evidence: ${row.claim_name || row.claim_type || "claim"}`);
    addCandidate(candidates, row.original_evidence_file, `privacy/risk original evidence: ${row.claim_name || "claim"}`);
  }

  for (const row of readCsv(path.join(censusDir, "critical_mechanisms.csv"))) {
    addCandidate(candidates, row.evidence_file, `policy mechanism: ${row.mechanism_id || row.mechanism_type || "mechanism"}`);
  }

  return candidates;
}

function beautifiedInfo(relFile) {
  const ext = path.extname(relFile);
  const relBeautified = relFile.slice(0, -ext.length) + ".beautified" + ext;
  return {
    relBeautified,
    fullBeautified: path.join(extDir, relBeautified),
  };
}

function simpleBeautifyJavaScript(text) {
  const out = [];
  let indent = 0;
  let quote = null;
  let escaped = false;

  function newline() {
    while (out.length && /[ \t]/.test(out[out.length - 1])) out.pop();
    out.push("\n", "  ".repeat(Math.max(0, indent)));
  }

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (quote) {
      out.push(ch);
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      out.push(ch);
    } else if (ch === "{") {
      out.push(ch);
      indent += 1;
      newline();
    } else if (ch === "}") {
      indent -= 1;
      newline();
      out.push(ch);
      if (text[i + 1] && text[i + 1] !== ";" && text[i + 1] !== "," && text[i + 1] !== ")" && text[i + 1] !== "]") {
        newline();
      }
    } else if (ch === ";") {
      out.push(ch);
      newline();
    } else if (ch === ",") {
      out.push(ch);
      if (out.length > 120 && !/[({[]/.test(text[i - 1] || "")) newline();
    } else {
      out.push(ch);
    }
  }

  return out.join("").replace(/\n[ \t]*\n[ \t]*/g, "\n");
}

function runExternalBeautifier(npxCmd, fullOriginal, fullBeautified) {
  execFileSync(npxCmd, ["js-beautify", fullOriginal, "-o", fullBeautified], { stdio: "pipe" });
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(extDir)) {
    console.error(`Extension directory not found: ${extDir}`);
    process.exit(2);
  }

  const sourceInventory = path.join(censusDir, "source_file_inventory.csv");
  if (!fs.existsSync(sourceInventory)) {
    const skipped = [
      {
        original: "unknown",
        beautified: "",
        status: "skipped: source_file_inventory.csv missing; run source_chunk_inventory.js first",
        selection_reason: "no runtime inventory available",
      },
    ];
    fs.writeFileSync(path.join(outDir, "beautify_map.json"), JSON.stringify(skipped, null, 2), "utf8");
    console.log("No source inventory found. Wrote skipped beautify_map.json instead of scanning every JS file.");
    return;
  }

  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const entries = [];
  const candidates = loadCandidates();

  for (const [relFile, reasons] of [...candidates.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const fullOriginal = safeFullPath(relFile);
    if (!fullOriginal) continue;
    const { relBeautified, fullBeautified } = beautifiedInfo(relFile);
    let status = "ok";

    if (!fs.existsSync(fullBeautified)) {
      try {
        runExternalBeautifier(npxCmd, fullOriginal, fullBeautified);
      } catch (err) {
        try {
          const originalText = fs.readFileSync(fullOriginal, "utf8");
          fs.writeFileSync(fullBeautified, simpleBeautifyJavaScript(originalText), "utf8");
          status = `ok: fallback-simple (${(err.stderr && String(err.stderr).trim()) || err.message})`;
        } catch (fallbackErr) {
          status = `error: ${(fallbackErr.stderr && String(fallbackErr.stderr).trim()) || fallbackErr.message}`;
        }
      }
    }

    entries.push({
      original: posix(path.join("extension", relFile)),
      beautified: posix(path.join("extension", relBeautified)),
      status,
      selection_reason: [...reasons].sort().join(" | "),
    });
  }

  fs.writeFileSync(path.join(outDir, "beautify_map.json"), JSON.stringify(entries, null, 2), "utf8");
  console.log(`Wrote beautify map with ${entries.length} runtime/evidence-bearing entr${entries.length === 1 ? "y" : "ies"}.`);
}

main();
