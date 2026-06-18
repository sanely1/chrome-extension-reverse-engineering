#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const sourceDir = process.argv[2];
const outDir = process.argv[3];

if (!sourceDir || !outDir) {
  console.error("Usage: node tools/source_chunk_inventory.js <extension_dir> <OUT_DIR>");
  process.exit(2);
}

const root = path.resolve(sourceDir);
const out = path.resolve(outDir);
const censusDir = path.join(out, "census");
fs.mkdirSync(censusDir, { recursive: true });

const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || 2000);
const EXCLUDE_PARTS = new Set([
  "node_modules",
  "coverage",
  ".git",
  "privacy_workspace",
]);

function posix(p) {
  return p.split(path.sep).join("/");
}

function rel(p) {
  return posix(path.relative(root, p));
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(file, headers, rows) {
  const body = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
  ].join("\n");
  fs.writeFileSync(file, body + "\n", "utf8");
}

function shouldSkip(file) {
  const scoped = path.isAbsolute(file) && file.startsWith(root)
    ? path.relative(root, file)
    : file;
  const parts = scoped.split(path.sep);
  if (parts.some((part) => EXCLUDE_PARTS.has(part))) return true;
  if (parts.some((part) => /^out_\d+_/i.test(part))) return true;
  if (parts.some((part) => /beautified/i.test(part))) return true;
  if (/\.map$/i.test(scoped)) return true;
  return false;
}

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (shouldSkip(full)) continue;
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

function addFile(files, file, role, source, reason) {
  if (!file) return;
  const normalized = file.replace(/^\/+/, "");
  const full = path.resolve(root, normalized);
  if (!full.startsWith(root)) return;
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return;
  if (!/\.(m?js|cjs)$/i.test(full)) return;
  if (shouldSkip(full)) return;
  const key = rel(full);
  if (!files.has(key)) {
    files.set(key, {
      file: key,
      role,
      source,
      reason,
      full,
    });
  } else {
    const row = files.get(key);
    if (!row.role.includes(role)) row.role += `|${role}`;
    if (!row.source.includes(source)) row.source += `|${source}`;
    if (!row.reason.includes(reason)) row.reason += ` | ${reason}`;
  }
}

function scriptSrcsFromHtml(htmlText) {
  const refs = [];
  const re = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const modulePreload = /<link\b[^>]*\brel\s*=\s*["']modulepreload["'][^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = re.exec(htmlText))) refs.push(match[1]);
  while ((match = modulePreload.exec(htmlText))) refs.push(match[1]);
  return refs.filter((src) => !/^(https?:)?\/\//i.test(src));
}

function stringsFromArrayLiteral(text) {
  const values = [];
  const re = /["']([^"']+\.(?:m?js|cjs))["']/gi;
  let match;
  while ((match = re.exec(text))) values.push(match[1]);
  return values;
}

function discoverDynamicRefs(fileText) {
  const refs = [];
  const importScripts = /importScripts\s*\(([^)]*)\)/gi;
  const dynamicImport = /import\s*\(\s*["']([^"']+\.(?:m?js|cjs))["']\s*\)/gi;
  const executeScript = /executeScript\s*\(\s*\{[\s\S]{0,2000}?files\s*:\s*\[([\s\S]{0,1000}?)\]/gi;
  let match;

  while ((match = importScripts.exec(fileText))) refs.push(...stringsFromArrayLiteral(match[1]));
  while ((match = dynamicImport.exec(fileText))) refs.push(match[1]);
  while ((match = executeScript.exec(fileText))) refs.push(...stringsFromArrayLiteral(match[1]));

  return refs;
}

function resolveNear(baseFile, ref) {
  if (!ref || /^(https?:)?\/\//i.test(ref)) return null;
  const cleaned = ref.split(/[?#]/)[0].replace(/^\/+/, "");
  const near = path.resolve(path.dirname(baseFile), cleaned);
  if (near.startsWith(root) && fs.existsSync(near)) return near;
  const fromRoot = path.resolve(root, cleaned);
  if (fromRoot.startsWith(root) && fs.existsSync(fromRoot)) return fromRoot;
  return null;
}

function lineCount(file) {
  const text = fs.readFileSync(file, "utf8");
  if (!text) return 1;
  return text.split(/\r?\n/).length;
}

function build() {
  const files = new Map();
  const manifestPath = path.join(root, "manifest.json");
  const manifest = readJson(manifestPath) || {};

  const background = manifest.background || {};
  addFile(files, background.service_worker, "background", "manifest", "background.service_worker");
  for (const script of background.scripts || []) {
    addFile(files, script, "background", "manifest", "background.scripts");
  }

  for (const cs of manifest.content_scripts || []) {
    for (const script of cs.js || []) {
      addFile(files, script, "content_script", "manifest", "content_scripts[].js");
    }
  }

  const htmlRefs = [
    manifest.action && manifest.action.default_popup,
    manifest.browser_action && manifest.browser_action.default_popup,
    manifest.page_action && manifest.page_action.default_popup,
    manifest.options_page,
    manifest.options_ui && manifest.options_ui.page,
    manifest.side_panel && manifest.side_panel.default_path,
    manifest.devtools_page,
  ].filter(Boolean);

  const chromeUrlOverrides = manifest.chrome_url_overrides || {};
  for (const key of Object.keys(chromeUrlOverrides)) {
    if (chromeUrlOverrides[key]) htmlRefs.push(chromeUrlOverrides[key]);
  }

  for (const resource of manifest.web_accessible_resources || []) {
    const resources = Array.isArray(resource.resources) ? resource.resources : [];
    for (const pattern of resources) {
      if (/\.(html?|xhtml)$/i.test(pattern) && !pattern.includes("*")) {
        htmlRefs.push(pattern);
      }
    }
  }

  for (const htmlRef of htmlRefs) {
    const htmlPath = path.resolve(root, htmlRef.replace(/^\/+/, ""));
    if (!htmlPath.startsWith(root) || !fs.existsSync(htmlPath)) continue;
    const html = fs.readFileSync(htmlPath, "utf8");
    for (const src of scriptSrcsFromHtml(html)) {
      const full = resolveNear(htmlPath, src);
      if (full) addFile(files, rel(full), "ui_script", "html", `${rel(htmlPath)} script src`);
    }
  }

  for (const resource of manifest.web_accessible_resources || []) {
    const resources = Array.isArray(resource.resources) ? resource.resources : [];
    for (const pattern of resources) {
      if (/\.(m?js|cjs)$/i.test(pattern) && !pattern.includes("*")) {
        addFile(files, pattern, "web_accessible_script", "manifest", "web_accessible_resources");
      }
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const row of [...files.values()]) {
      const text = fs.readFileSync(row.full, "utf8");
      for (const ref of discoverDynamicRefs(text)) {
        const full = resolveNear(row.full, ref);
        if (!full) continue;
        const before = files.size;
        addFile(files, rel(full), "dynamic_dependency", row.file, `referenced by ${row.file}`);
        if (files.size > before) changed = true;
      }
    }
  }

  if (files.size === 0) {
    for (const file of walk(root).filter((f) => /\.(m?js|cjs)$/i.test(f))) {
      addFile(files, rel(file), "fallback_runtime_candidate", "filesystem", "no manifest/HTML runtime JS discovered");
    }
  }

  const inventoryRows = [];
  const chunkRows = [];

  for (const row of [...files.values()].sort((a, b) => a.file.localeCompare(b.file))) {
    const lines = lineCount(row.full);
    const chunkCount = Math.max(1, Math.ceil(lines / CHUNK_SIZE));
    inventoryRows.push({
      file: row.file,
      role: row.role,
      source: row.source,
      reason: row.reason,
      line_count: lines,
      chunk_count: chunkCount,
      status: "included",
    });

    for (let i = 0; i < chunkCount; i += 1) {
      const start = i * CHUNK_SIZE + 1;
      const end = Math.min((i + 1) * CHUNK_SIZE, lines);
      chunkRows.push({
        file: row.file,
        chunk_id: chunkCount === 1 ? "whole-file" : `chunk-${i + 1}/${chunkCount}`,
        start_line: start,
        end_line: end,
        same_function_group: "",
        role: row.role,
        read_path: row.file,
      });
    }
  }

  writeCsv(path.join(censusDir, "source_file_inventory.csv"), [
    "file",
    "role",
    "source",
    "reason",
    "line_count",
    "chunk_count",
    "status",
  ], inventoryRows);

  writeCsv(path.join(censusDir, "source_chunks.csv"), [
    "file",
    "chunk_id",
    "start_line",
    "end_line",
    "same_function_group",
    "role",
    "read_path",
  ], chunkRows);

  console.log(`source files: ${inventoryRows.length}`);
  console.log(`source chunks: ${chunkRows.length}`);
}

build();
