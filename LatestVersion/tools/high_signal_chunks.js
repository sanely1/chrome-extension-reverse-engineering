#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const extensionDir = process.argv[2] || "./extension";
const outDir = process.argv[3];

if (!outDir) {
  console.error("Usage: node tools/high_signal_chunks.js <extension_dir> OUT_DIR");
  process.exit(2);
}

const censusDir = path.join(outDir, "census");
const chunksPath = path.join(censusDir, "source_chunks.csv");
const outputPath = path.join(censusDir, "high_signal_chunks.csv");

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
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

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(file, rows) {
  const headers = [
    "chunk_id",
    "file",
    "start_line",
    "end_line",
    "role",
    "signal_level",
    "signal_families",
    "matched_terms",
    "manual_review_required",
    "review_reason",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${lines.join("\n")}\n`, "utf8");
}

const signalPatterns = [
  {
    family: "document_or_input_text",
    terms: [
      /\btextContent\b/i,
      /\binnerText\b/i,
      /\bselection(Start|End)?\b/i,
      /\bcontenteditable\b/i,
      /\bgetSelection\b/i,
      /\btextarea\b/i,
      /\bgetTextFieldContent\b/i,
      /\bsetTextFieldContent\b/i,
      /\.doc\.toString\s*\(/i,
      /\bdocument\.body\b/i,
    ],
  },
  {
    family: "auth_identity_cookies",
    terms: [
      /\bchrome\.identity\b/i,
      /\bbrowser\.identity\b/i,
      /\bchrome\.cookies\b/i,
      /\bcookies?\.(get|getAll|set|remove|onChanged)\b/i,
      /\bauth(Token|Key|Value)?\b/i,
      /\boauth\b/i,
      /\bjwt\b/i,
      /\bemail\b/i,
    ],
  },
  {
    family: "network_transmission",
    terms: [
      /\bfetch\s*\(/i,
      /\bXMLHttpRequest\b/i,
      /\bWebSocket\b/i,
      /\bnavigator\.sendBeacon\b/i,
      /\bpostMessage\s*\(/i,
      /\bchrome\.runtime\.sendMessage\b/i,
      /\bchrome\.tabs\.sendMessage\b/i,
      /\bconnect\s*\(/i,
      /\bhttps?:\/\//i,
      /\bwss?:\/\//i,
    ],
  },
  {
    family: "telemetry_tracking",
    terms: [
      /\banalytics\b/i,
      /\btelemetry\b/i,
      /\bmetrics?\b/i,
      /\btrack(ing)?\b/i,
      /\blog(Event|ger)?\b/i,
      /\bbeacon\b/i,
      /\bsentry\b/i,
      /\bmixpanel\b/i,
    ],
  },
  {
    family: "storage_persistence",
    terms: [
      /\bchrome\.storage\b/i,
      /\bbrowser\.storage\b/i,
      /\blocalStorage\b/i,
      /\bsessionStorage\b/i,
      /\bindexedDB\b/i,
      /\bcaches\.open\b/i,
      /\bsetItem\s*\(/i,
      /\bgetItem\s*\(/i,
    ],
  },
  {
    family: "remote_config_or_dynamic_behavior",
    terms: [
      /\bremoteConfig\b/i,
      /\bfeature[_-]?flag/i,
      /\btreatment\b/i,
      /\bexperiment\b/i,
      /\bab[_-]?test/i,
      /\bgate(s)?\b/i,
      /\beval\s*\(/i,
      /\bnew Function\b/i,
      /\bimportScripts\s*\(/i,
      /\bimport\s*\(/i,
      /\bchrome\.scripting\.executeScript\b/i,
    ],
  },
  {
    family: "page_access_injection",
    terms: [
      /\bdocument\.createElement\s*\(\s*["']script/i,
      /\bappendChild\s*\(/i,
      /\binsertCSS\b/i,
      /\bMutationObserver\b/i,
      /\bResizeObserver\b/i,
      /\bquerySelector(All)?\b/i,
      /\bshadowRoot\b/i,
      /\biframe\b/i,
      /\ball_frames\b/i,
    ],
  },
  {
    family: "crypto_or_encoded_payload",
    terms: [
      /\bcrypto\.subtle\b/i,
      /\bSubtleCrypto\b/i,
      /\bencrypt/i,
      /\bdecrypt/i,
      /\batob\s*\(/i,
      /\bbtoa\s*\(/i,
      /\bbase64\b/i,
      /\bArrayBuffer\b/i,
    ],
  },
];

if (!fs.existsSync(chunksPath)) {
  console.error(`Missing ${chunksPath}. Run source_chunk_inventory.js first.`);
  process.exit(1);
}

const chunks = parseCsv(read(chunksPath));
const highSignalRows = [];

for (const chunk of chunks) {
  const relFile = String(chunk.file || "").replace(/\\/g, "/");
  const fullPath = path.join(extensionDir, relFile);
  if (!fs.existsSync(fullPath)) continue;

  const text = read(fullPath);
  const lines = text.split(/\r?\n/);
  const start = Math.max(1, Number(chunk.start_line || 1));
  const end = Math.min(lines.length || 1, Number(chunk.end_line || lines.length || 1));
  const chunkText = lines.slice(start - 1, end).join("\n");

  const families = [];
  const matched = [];

  for (const group of signalPatterns) {
    const groupHits = [];
    for (const pattern of group.terms) {
      const match = chunkText.match(pattern);
      if (match) groupHits.push(match[0]);
    }
    if (groupHits.length) {
      families.push(group.family);
      matched.push(`${group.family}:${[...new Set(groupHits)].slice(0, 8).join("|")}`);
    }
  }

  const role = String(chunk.role || "");
  const criticalFamilies = new Set([
    "document_or_input_text",
    "auth_identity_cookies",
    "telemetry_tracking",
    "storage_persistence",
    "network_transmission",
  ]);
  const hasCriticalFamily = families.some((family) => criticalFamilies.has(family));
  const signalLevel =
    families.length >= 2 || hasCriticalFamily ? "high" : families.length >= 1 ? "medium" : "low";

  if (signalLevel === "high" || signalLevel === "medium") {
    highSignalRows.push({
      chunk_id: chunk.chunk_id || "",
      file: relFile,
      start_line: start,
      end_line: end,
      role,
      signal_level: signalLevel,
      signal_families: families.join(";"),
      matched_terms: matched.join("; "),
      manual_review_required: signalLevel === "high" ? "yes" : "review_if_used_in_final",
      review_reason:
        signalLevel === "high"
          ? "Multiple privacy/risk signal families were detected in this runtime chunk."
          : "Runtime chunk contains at least one privacy/risk signal or is an important extension entry/dependency.",
    });
  }
}

writeCsv(outputPath, highSignalRows);
console.log(`Wrote ${highSignalRows.length} high-signal chunk row(s) to ${outputPath}`);
