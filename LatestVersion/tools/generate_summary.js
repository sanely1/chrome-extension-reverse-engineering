#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const outDir = path.resolve(process.argv[2] || path.join(projectRoot, "out_001_gemini_3.5_flash"));
const extensionDir = path.resolve(process.argv[3] || path.join(projectRoot, "extension"));
const censusDir = path.join(outDir, "census");

function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((v) => v.trim() !== "")) rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((values) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] || "").trim();
    });
    return obj;
  });
}

function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  return parseCsv(fs.readFileSync(file, "utf8"));
}

function toInt(value, fallback = 1) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeEvidenceFile(file) {
  if (!file) return "extension/unknown";
  let normalized = String(file).replace(/\\/g, "/").replace(/^\.?\//, "");
  normalized = normalized.replace(/^beautified\//, "");
  if (normalized.startsWith("extension/")) return normalized;
  if (normalized.includes("/extension/")) {
    return `extension/${normalized.split("/extension/").pop()}`;
  }
  return `extension/${normalized}`;
}

function evidence(file, start, end) {
  const s = toInt(start, 1);
  const e = toInt(end, s);
  return {
    file: normalizeEvidenceFile(file),
    start: s,
    end: e < s ? s : e,
  };
}

function splitList(value) {
  if (!value) return [];
  return String(value)
    .split(/[|;]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function uniq(values) {
  return [...new Set(values.filter((v) => v !== undefined && v !== null && String(v).trim() !== "").map(String))];
}

function pick(row, names, fallback = "") {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== "") return row[name];
  }
  return fallback;
}

function decisionIs(row, allowed) {
  return allowed.includes(String(row.decision || "").toLowerCase());
}

function inferEndpointPurpose(url) {
  const u = String(url || "").toLowerCase();
  if (/wss?:\/\/|\/fpws|capi/.test(u)) return "Realtime service communication or document analysis transport";
  if (/auth|oauth|login|account|subscription/.test(u)) return "Authentication, account, or subscription service";
  if (/log|metric|telemetry|femetrics|gnar|sentry|beacon/.test(u)) return "Telemetry, analytics, logging, or diagnostics";
  if (/config|treatment|gate|feature|policy/.test(u)) return "Remote configuration, treatment, or feature-gating";
  if (/asset|cdn|font|image|static|bundle|cloudfront|applet/.test(u)) return "Static asset or UI bundle loading";
  if (/skill|assistant|rewrite|ai/.test(u)) return "Assistant or writing feature service";
  return "External service communication observed in source";
}

function loadManifest() {
  const manifest = readJson(path.join(extensionDir, "manifest.json"), {});
  return manifest || {};
}

function resolveManifestName(manifest) {
  const rawName = manifest.name || "unknown";
  const match = /^__MSG_(.+)__$/.exec(rawName);
  if (!match) return rawName;
  const key = match[1];
  const localesDir = path.join(extensionDir, "_locales");
  const candidates = [];
  if (manifest.default_locale) candidates.push(manifest.default_locale);
  if (fs.existsSync(localesDir)) {
    for (const entry of fs.readdirSync(localesDir)) {
      if (!candidates.includes(entry)) candidates.push(entry);
    }
  }
  for (const locale of candidates) {
    const messages = readJson(path.join(localesDir, locale, "messages.json"), null);
    const value = messages && messages[key] && messages[key].message;
    if (value) return value;
  }
  return "unknown";
}

function manifestEvidenceFor(key, manifest) {
  if (!manifest || Object.keys(manifest).length === 0) return [];
  return [evidence("extension/manifest.json", 1, 1)];
}

function buildComponents(manifest) {
  const backgroundFiles = [];
  if (manifest.background) {
    if (manifest.background.service_worker) backgroundFiles.push(`extension/${manifest.background.service_worker}`);
    if (Array.isArray(manifest.background.scripts)) {
      backgroundFiles.push(...manifest.background.scripts.map((f) => `extension/${f}`));
    }
  }

  const contentScripts = (manifest.content_scripts || []).map((script) => ({
    files: [...(script.js || []), ...(script.css || [])].map((f) => `extension/${f}`),
    apis: [],
    listeners: [],
    evidence: manifestEvidenceFor("content_scripts", manifest),
  }));

  const webAccessible = [];
  for (const item of manifest.web_accessible_resources || []) {
    if (typeof item === "string") webAccessible.push(item);
    if (Array.isArray(item.resources)) webAccessible.push(...item.resources);
  }

  const ui = [];
  const actionPopup = manifest.action && manifest.action.default_popup;
  const browserActionPopup = manifest.browser_action && manifest.browser_action.default_popup;
  if (actionPopup || browserActionPopup) {
    ui.push({
      files: [`extension/${actionPopup || browserActionPopup}`],
      apis: [],
      listeners: [],
      evidence: manifestEvidenceFor("action", manifest),
    });
  }
  if (manifest.options_page) {
    ui.push({ files: [`extension/${manifest.options_page}`], apis: [], listeners: [], evidence: manifestEvidenceFor("options_page", manifest) });
  }
  if (manifest.side_panel && manifest.side_panel.default_path) {
    ui.push({ files: [`extension/${manifest.side_panel.default_path}`], apis: [], listeners: [], evidence: manifestEvidenceFor("side_panel", manifest) });
  }

  return {
    background: {
      files: backgroundFiles,
      apis: [],
      listeners: [],
      evidence: backgroundFiles.length ? manifestEvidenceFor("background", manifest) : [],
    },
    content_scripts: contentScripts,
    injected_scripts: [],
    ui,
    web_accessible_resources: webAccessible,
  };
}

function applyEvidenceReview(section, name, draftEvidence) {
  const rows = readCsv(path.join(censusDir, "privacy_risk_evidence_review.csv"));
  const row = rows.find((r) =>
    String(r.claim_section || "").toLowerCase() === section.toLowerCase() &&
    String(r.claim_name || "").toLowerCase() === String(name || "").toLowerCase() &&
    ["narrow_evidence_confirmed", "broad_range_justified"].includes(String(r.decision || "").toLowerCase())
  );
  if (!row) return draftEvidence;
  const preciseStart = pick(row, ["precise_start", "evidence_start", "draft_start"], "");
  const preciseEnd = pick(row, ["precise_end", "evidence_end", "draft_end"], preciseStart);
  return [evidence(pick(row, ["evidence_file"], draftEvidence[0] && draftEvidence[0].file), preciseStart, preciseEnd)];
}

function buildEndpoints() {
  const rows = readCsv(path.join(outDir, "endpoints.csv"));
  const byUrl = new Map();
  for (const row of rows) {
    const url = pick(row, ["url"]);
    if (!url) continue;
    if (!byUrl.has(url)) {
      byUrl.set(url, {
        url,
        purpose: inferEndpointPurpose(url),
        methods: [],
        headers: [],
        evidence: [],
      });
    }
    const item = byUrl.get(url);
    const method = pick(row, ["method", "methods"], "GET");
    if (method && !item.methods.includes(method)) item.methods.push(method);
    if (item.evidence.length < 5) {
      item.evidence.push(evidence(pick(row, ["file", "evidence_file"]), pick(row, ["line_start", "start", "evidence_start"]), pick(row, ["line_end", "end", "evidence_end"])));
    }
  }
  return [...byUrl.values()];
}

function isFakeMessageName(name) {
  const low = String(name || "").trim().toLowerCase();
  if (!low) return true;
  if (low.includes("${") || low.includes(".concat")) return true;
  if (/^\d+(?:\.\d+){1,}$/.test(low)) return true;
  if (/https?:\/\/|^[\w.-]+\.(com|io|net|org)(\/|$)/.test(low)) return true;
  if (/^(failed|could not|unable|invalid|unknown|something went wrong|an error|error|please|click to|checking service)/.test(low)) return true;
  const generic = new Set("function tostring valueof undefined null true false span div body html click load error close open flush failure success resolve reject checkbox radio button input textarea select option item menu section transition text icon slider listbox tooltip dialog alert banner link row column grid tab tabpanel img image svg path ltr rtl top bottom left right childlist subtree attributes characterdata general disconnect".split(" "));
  return generic.has(low);
}

function buildMessages() {
  const rows = readCsv(path.join(outDir, "messages.csv"));
  const channels = [];
  const seen = new Set();
  for (const row of rows) {
    const name = pick(row, ["channel_name", "name"]);
    if (isFakeMessageName(name)) continue;
    const direction = pick(row, ["direction"], "other") || "other";
    const key = `${name}\u0000${direction}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const payloadKeys = splitList(pick(row, ["payload_keys", "payload_schema"]));
    const properties = {};
    payloadKeys.forEach((k) => {
      properties[k] = { type: "string" };
    });
    channels.push({
      name,
      direction,
      payload_schema: { type: "object", properties },
      evidence: [evidence(pick(row, ["file", "evidence_file"]), pick(row, ["line_start", "start", "evidence_start"]), pick(row, ["line_end", "end", "evidence_end"]))],
    });
  }
  return channels;
}

function isFakeStorageKey(key) {
  const low = String(key || "").trim().toLowerCase();
  return !low || ["schema", "ltr", "rtl", "autoincrement", "keypath", "border-box", "content-box"].includes(low) || low.startsWith("schema|") || low.endsWith(".");
}

function normalizeStorageType(type) {
  const low = String(type || "").toLowerCase();
  if (low.includes("indexed")) return "indexeddb";
  if (low.includes("cookie")) return "cookies";
  if (low.includes("managed")) return "managed";
  if (low.includes("sync")) return "sync";
  return "local";
}

function buildStorage() {
  const rows = readCsv(path.join(outDir, "storage_keys.csv"));
  const seen = new Set();
  const keys = [];
  for (const row of rows) {
    const key = pick(row, ["key"]);
    if (isFakeStorageKey(key)) continue;
    const type = normalizeStorageType(pick(row, ["type"]));
    const seenKey = `${type}\u0000${key}`;
    if (seen.has(seenKey)) continue;
    seen.add(seenKey);
    keys.push({
      key,
      type,
      purpose: pick(row, ["purpose"], "Storage key observed in source"),
      retention: pick(row, ["retention"], type === "session" ? "session" : "unknown"),
      evidence: [evidence(pick(row, ["file", "evidence_file"]), pick(row, ["line_start", "start", "evidence_start"]), pick(row, ["line_end", "end", "evidence_end"]))],
    });
  }
  return keys;
}

function buildWorkflows() {
  const rows = readCsv(path.join(censusDir, "workflow_candidate_review.csv"));
  return rows
    .filter((row) => ["confirmed_workflow", "likely_workflow"].includes(String(row.decision || "").toLowerCase()))
    .map((row) => ({
      name: pick(row, ["candidate_name", "name"], "Unnamed Workflow"),
      triggers: splitList(pick(row, ["triggers"])),
      steps: splitList(pick(row, ["steps_summary", "steps"])).length ? splitList(pick(row, ["steps_summary", "steps"])) : [pick(row, ["reason"], "Observed workflow")],
      apis: splitList(pick(row, ["apis"])),
      messages: splitList(pick(row, ["messages"])),
      endpoints: splitList(pick(row, ["endpoints"])),
      storage_keys: splitList(pick(row, ["storage_keys"])),
      evidence: splitList(pick(row, ["evidence_files", "evidence_file"])).map((f) => evidence(f, pick(row, ["evidence_start"], 1), pick(row, ["evidence_end"], 1))),
    }));
}

function buildPrivacyItems() {
  const rows = readCsv(path.join(censusDir, "privacy_candidate_review.csv"));
  return rows
    .filter((row) => decisionIs(row, ["confirmed_privacy_flow", "likely_privacy_flow"]))
    .map((row) => {
      const name = pick(row, ["data_name"], "Unnamed Privacy Flow");
      const draftEvidence = [evidence(pick(row, ["evidence_file"]), pick(row, ["evidence_start"]), pick(row, ["evidence_end"]))];
      return {
        data_name: name,
        data_description: pick(row, ["reason", "data_description"], pick(row, ["data_type"], "Privacy-relevant data flow observed in source")),
        source: pick(row, ["source", "source_signal_ids"], "source evidence"),
        operation: pick(row, ["operation"], "unknown"),
        collection_trigger: pick(row, ["collection_trigger"], "unknown"),
        storage: {
          stored: String(pick(row, ["storage_type", "storage_key"])).trim() !== "",
          type: pick(row, ["storage_type"], "unknown"),
          key: pick(row, ["storage_key"], "unknown"),
          retention: pick(row, ["retention"], "unknown"),
        },
        transmission: {
          transmitted: /^(true|yes|1)$/i.test(pick(row, ["transmitted"], "")) || pick(row, ["endpoint", "recipient"], "") !== "",
          recipient: pick(row, ["recipient"], "unknown"),
          endpoint: pick(row, ["endpoint"], "unknown"),
          method: pick(row, ["method"], "unknown"),
          payload_fields: splitList(pick(row, ["payload_fields"])),
        },
        local_processing: splitList(pick(row, ["local_processing"])),
        user_control_or_consent: pick(row, ["user_control_or_consent"], "unknown"),
        purpose_observed: pick(row, ["purpose_observed"], "unknown"),
        confidence: pick(row, ["confidence"], "unknown"),
        evidence: applyEvidenceReview("privacy", name, draftEvidence),
      };
    });
}

function buildRisks() {
  const rows = readCsv(path.join(censusDir, "risk_candidate_review.csv"));
  return rows
    .filter((row) => decisionIs(row, ["confirmed_risk", "likely_risk", "mitigated_low_risk"]))
    .map((row) => {
      const name = pick(row, ["risk_name"], pick(row, ["risk_type"], "risk"));
      const decision = String(row.decision || "").toLowerCase();
      const draftEvidence = [evidence(pick(row, ["evidence_file"]), pick(row, ["evidence_start"]), pick(row, ["evidence_end"]))];
      return {
        type: pick(row, ["risk_type"], "other"),
        severity: decision === "mitigated_low_risk" ? "low" : pick(row, ["severity"], "low"),
        justification: pick(row, ["why_it_matters", "reason"], "Risk candidate confirmed by reviewed evidence."),
        evidence: applyEvidenceReview("risk", name, draftEvidence),
      };
    });
}

function buildPrivacySummary(privacyItems) {
  return {
    data_categories: uniq(privacyItems.map((item) => item.data_name)),
    purposes: uniq(privacyItems.map((item) => item.purpose_observed)),
    minimization: "unknown",
    consent: "unknown",
    retention: "unknown",
    third_parties: uniq(privacyItems.map((item) => item.transmission && item.transmission.recipient).filter((x) => x && x !== "unknown")).map((name) => ({
      name,
      purpose: "Observed recipient in privacy data flow",
      evidence: [],
    })),
    policy_compliance: "unknown",
    evidence: [],
  };
}

function buildCodeSignals() {
  const discovered = readJson(path.join(outDir, "discovered_apis.json"), null);
  if (!discovered) {
    return { chrome_api_calls: [], event_listeners: [], dynamic_code: [], wasm_modules: [], third_party_libs: [] };
  }
  const apis = [];
  const listeners = [];
  const walk = (value) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if (k.toLowerCase().includes("api") && Array.isArray(v)) apis.push(...v);
        if (k.toLowerCase().includes("listener") && Array.isArray(v)) listeners.push(...v);
        walk(v);
      }
    }
  };
  walk(discovered);
  return { chrome_api_calls: uniq(apis), event_listeners: uniq(listeners), dynamic_code: [], wasm_modules: [], third_party_libs: [] };
}

const manifest = loadManifest();
const privacyItems = buildPrivacyItems();
const risks = buildRisks();
const summary = {
  metadata: {
    name: resolveManifestName(manifest),
    version: manifest.version || "unknown",
    manifest_version: manifest.manifest_version || 0,
    description: manifest.description || "",
    evidence: manifestEvidenceFor("metadata", manifest),
  },
  permissions: {
    api_permissions: manifest.permissions || [],
    host_permissions: manifest.host_permissions || [],
    optional_permissions: manifest.optional_permissions || [],
    evidence: manifestEvidenceFor("permissions", manifest),
  },
  components: buildComponents(manifest),
  network: { endpoints: buildEndpoints() },
  messaging: { channels: buildMessages() },
  storage: { keys: buildStorage() },
  workflows: buildWorkflows(),
  observed_privacy_data: { items: privacyItems, evidence: [] },
  privacy: buildPrivacySummary(privacyItems),
  risks,
  code_signals: buildCodeSignals(),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "extension_summary.json"), JSON.stringify(summary, null, 2));
console.log(`Generated extension_summary.json from reviewed artifacts: ${privacyItems.length} privacy item(s), ${risks.length} risk(s).`);
