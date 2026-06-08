#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const outDir = process.argv[2];

if (!outDir) {
  console.error("Usage: node tools/privacy_risk_linter.js OUT_DIR");
  process.exit(2);
}

const summaryPath = path.join(outDir, "extension_summary.json");
const censusDir = path.join(outDir, "census");
const matrixPath = path.join(censusDir, "privacy_signal_matrix.csv");
const privacyReviewPath = path.join(censusDir, "privacy_candidate_review.csv");
const riskReviewPath = path.join(censusDir, "risk_candidate_review.csv");
const evidenceReviewPath = path.join(censusDir, "privacy_risk_evidence_review.csv");
const semanticReviewPath = path.join(censusDir, "semantic_architecture_review.csv");
const auditPath = path.join(censusDir, "privacy_risk_audit.md");

const failures = [];
const warnings = [];

function exists(p) {
  return fs.existsSync(p) && fs.statSync(p).isFile();
}

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function hasAudit() {
  if (!exists(auditPath)) return false;
  return readText(auditPath).trim().length > 0;
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

function getArray(obj, pathParts) {
  let cur = obj;
  for (const part of pathParts) {
    if (!cur || typeof cur !== "object") return [];
    cur = cur[part];
  }
  return Array.isArray(cur) ? cur : [];
}

function textOf(value) {
  return JSON.stringify(value || "").toLowerCase();
}

let summary;
try {
  summary = JSON.parse(readText(summaryPath));
} catch (err) {
  failures.push(`Cannot read or parse extension_summary.json: ${err.message}`);
  finish();
}

const endpoints = getArray(summary, ["network", "endpoints"]);
const messages = getArray(summary, ["messaging", "channels"]);
const storage = getArray(summary, ["storage", "keys"]);
const workflows = getArray(summary, ["workflows"]);
const privacyItems = getArray(summary, ["observed_privacy_data", "items"]);
const risks = getArray(summary, ["risks"]);
const permissions = summary.permissions || {};

for (const [label, p] of [
  ["privacy_signal_matrix.csv", matrixPath],
  ["privacy_candidate_review.csv", privacyReviewPath],
  ["risk_candidate_review.csv", riskReviewPath],
  ["privacy_risk_evidence_review.csv", evidenceReviewPath],
]) {
  if (!exists(p)) failures.push(`Missing required privacy/risk review file: census/${label}`);
}

let privacyReview = [];
let riskReview = [];
let evidenceReview = [];
let semanticReview = [];
if (exists(privacyReviewPath)) privacyReview = parseCsv(readText(privacyReviewPath));
if (exists(riskReviewPath)) riskReview = parseCsv(readText(riskReviewPath));
if (exists(evidenceReviewPath)) evidenceReview = parseCsv(readText(evidenceReviewPath));
if (exists(semanticReviewPath)) semanticReview = parseCsv(readText(semanticReviewPath));

if (!exists(semanticReviewPath)) {
  warnings.push("Missing census/semantic_architecture_review.csv; risk mapping from semantic architecture signals cannot be checked.");
}

const confirmedPrivacy = privacyReview.filter((r) =>
  ["confirmed_privacy_flow", "likely_privacy_flow"].includes((r.decision || "").toLowerCase())
);
const confirmedRisks = riskReview.filter((r) =>
  ["confirmed_risk", "likely_risk", "mitigated_low_risk"].includes((r.decision || "").toLowerCase())
);

const reviewedRiskDecisions = new Set([
  "confirmed_risk",
  "likely_risk",
  "mitigated_low_risk",
  "merged_risk",
  "rejected_candidate",
  "uncertain_candidate",
]);

function normalizeTokens(text) {
  const stopWords = new Set([
    "risk",
    "risks",
    "medium",
    "high",
    "low",
    "data",
    "local",
    "remote",
    "behavior",
    "behaviour",
    "extension",
    "confirmed",
    "direct",
    "evidence",
    "source",
    "without",
    "with",
    "from",
    "that",
    "this",
    "only",
    "uses",
    "used",
    "user",
    "users",
  ]);
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !stopWords.has(token));
}

function semanticRiskNeedsReview(row) {
  const impact = String(row.risk_impact || "").trim().toLowerCase();
  if (!impact) return false;
  if (/^(none|n\/a|unknown|no risk|no concrete risk)/i.test(impact)) return false;
  return true;
}

function riskReviewCoversSemanticRow(row) {
  const family = String(row.family || "").toLowerCase();
  const finding = String(row.finding || "");
  const behavior = String(row.data_or_behavior || "");
  const impact = String(row.risk_impact || "");
  const semanticTokens = new Set([
    family,
    ...normalizeTokens(finding),
    ...normalizeTokens(behavior),
    ...normalizeTokens(impact),
  ].filter(Boolean));

  return riskReview.some((riskRow) => {
    const decision = String(riskRow.decision || "").toLowerCase();
    if (!reviewedRiskDecisions.has(decision)) return false;
    const rowText = textOf(riskRow);
    if (family && rowText.includes(family)) return true;
    let hits = 0;
    for (const token of semanticTokens) {
      if (rowText.includes(token)) hits += 1;
      if (hits >= 2) return true;
    }
    return false;
  });
}

const unreviewedSemanticRiskRows = semanticReview.filter(
  (row) => semanticRiskNeedsReview(row) && !riskReviewCoversSemanticRow(row)
);

if (unreviewedSemanticRiskRows.length > 0 && !hasAudit()) {
  failures.push(
    `Found ${unreviewedSemanticRiskRows.length} semantic architecture row(s) with risk_impact that are not covered by risk_candidate_review.csv. Add confirmed/likely/mitigated_low/merged/rejected/uncertain risk review rows or explain the omissions in census/privacy_risk_audit.md. Missing families: ${[
      ...new Set(unreviewedSemanticRiskRows.map((r) => r.family || "(unknown)")),
    ].join(", ")}`
  );
}

if (privacyItems.length > confirmedPrivacy.length) {
  failures.push(
    `Final observed_privacy_data has ${privacyItems.length} item(s), but privacy_candidate_review has only ${confirmedPrivacy.length} confirmed/likely flow(s).`
  );
}

if (risks.length > confirmedRisks.length) {
  failures.push(
    `Final risks has ${risks.length} item(s), but risk_candidate_review has only ${confirmedRisks.length} confirmed/likely risk(s).`
  );
}

const allEndpointText = textOf(endpoints);
const allStorageText = textOf(storage);
const allMessageText = textOf(messages);
const allWorkflowText = textOf(workflows);
const allPrivacyText = textOf(privacyItems);
const allRiskText = textOf(risks);
const privacySummaryText = textOf(summary.privacy);

if (/\b(fully compliant|compliant with|is compliant|gdpr compliant|ccpa compliant)\b/i.test(privacySummaryText)) {
  failures.push(
    "Privacy summary contains an unsupported compliance claim. Use 'unknown' unless concrete code/policy evidence proves compliance."
  );
}

const hasTelemetry =
  /(analytics|telemetry|metrics|metric|track|tracking|log|logger|sentry|femetrics|gnar|beacon)/i.test(
    allEndpointText + allMessageText + allStorageText + allWorkflowText
  );
if (hasTelemetry && !/tracking|telemetry|analytics|metric|log|behavior/i.test(allPrivacyText + allRiskText)) {
  failures.push("Telemetry/logging signals exist, but final privacy/risk output does not clearly cover telemetry or tracking.");
}

const hasAuth =
  /(auth|oauth|identity|cookie|token|session|account|login|user(id)?|profile|subscription|premium)/i.test(
    allEndpointText + allMessageText + allStorageText + allWorkflowText + textOf(permissions)
  );
if (hasAuth && !/(auth|token|cookie|account|user|profile|credential|session|identity)/i.test(allPrivacyText)) {
  failures.push("Auth/account/cookie/token signals exist, but observed_privacy_data does not clearly cover auth or user identifiers.");
}

const hasContent =
  /(document|text|typing|input|contenteditable|selection|selected text|form field|page content|image|media|rewrite|grammar|spell|correction|assistant)/i.test(
    allMessageText + allStorageText + allWorkflowText
  );
if (hasContent && !/(document|text|input|content|selection|image|media|writing|typed|page)/i.test(allPrivacyText)) {
  failures.push("Page/content/text/media signals exist, but observed_privacy_data does not clearly cover user content.");
}

const broadHosts = (permissions.host_permissions || []).some((p) => /^(https?:\/\/\*\/\*|\*:\/\/\*\/\*)$/.test(String(p)));
const apiPerms = [...(permissions.api_permissions || permissions.granted_permissions || []), ...(permissions.optional_permissions || [])]
  .map(String)
  .join(" ");
const sensitivePerms = /(tabs|cookies|identity|scripting|clipboardRead|nativeMessaging|webRequest|declarativeNetRequest)/i.test(apiPerms);
if ((broadHosts || sensitivePerms) && !/excessive_permissions|permission|broad host|host permission|sensitive permission/i.test(allRiskText)) {
  failures.push("Broad host or sensitive API permissions exist, but risks do not clearly evaluate excessive_permissions or permission scope.");
}

const evidenceProblems = [];
const broadEvidenceProblems = [];
function evidencePathIsAllowed(file) {
  if (!file.startsWith("extension/")) return false;
  if (/analysis_notes\.md$|outline\.jsonl$|\.csv$/i.test(file)) return false;
  return true;
}

for (const [sectionName, arr] of [
  ["observed_privacy_data.items", privacyItems],
  ["risks", risks],
]) {
  arr.forEach((item, idx) => {
    const evidence = Array.isArray(item.evidence) ? item.evidence : [];
    if (evidence.length === 0) evidenceProblems.push(`${sectionName}[${idx}] has no evidence`);
    evidence.forEach((ev) => {
      const file = String((ev && ev.file) || "");
      if (!evidencePathIsAllowed(file)) {
        evidenceProblems.push(`${sectionName}[${idx}] evidence path is not an allowed extension source path: ${file || "(empty)"}`);
      }
      const start = Number(ev && ev.start);
      const end = Number(ev && ev.end);
      if (Number.isFinite(start) && Number.isFinite(end)) {
        const width = end - start + 1;
        if (width > 80) {
          broadEvidenceProblems.push(`${sectionName}[${idx}] uses broad evidence range ${file}:${start}-${end} (${width} lines)`);
        } else if (width > 40) {
          warnings.push(`${sectionName}[${idx}] uses moderately broad evidence range ${file}:${start}-${end} (${width} lines)`);
        }
      }
    });
  });
}
if (evidenceProblems.length > 0) failures.push(...evidenceProblems.slice(0, 20));

if (broadEvidenceProblems.length > 0 && !hasAudit()) {
  failures.push(
    ...broadEvidenceProblems.slice(0, 20),
    "Narrow privacy/risk evidence to the exact function/branch/callsite, or document why this is impossible in census/privacy_risk_audit.md."
  );
}

const evidenceReviewConfirmed = evidenceReview.filter((r) =>
  ["narrow_evidence_confirmed", "broad_range_justified"].includes((r.decision || "").toLowerCase())
);
if (evidenceReviewConfirmed.length < privacyItems.length + risks.length) {
  failures.push(
    `privacy_risk_evidence_review.csv has ${evidenceReviewConfirmed.length} confirmed/justified evidence row(s), but final privacy+risk has ${privacyItems.length + risks.length} item(s).`
  );
}

function hasMinifiedAnchor(row) {
  const fields = [
    "anchor",
    "matched_snippet",
    "snippet",
    "source_anchor",
    "string_anchor",
    "symbol",
    "offset",
    "byte_offset",
    "char_offset",
    "context",
    "notes",
    "reason",
  ];
  return fields.some((field) => String(row[field] || "").trim().length >= 6);
}

const unanchoredMinifiedEvidence = evidenceReview.filter((row) => {
  const file = String(row.beautified_evidence_file || row.evidence_file || row.file || "");
  if (/beautified/i.test(file)) return false;
  const start = Number(row.precise_start || row.evidence_start || row.draft_start || row.start);
  const end = Number(row.precise_end || row.evidence_end || row.draft_end || row.end);
  if (!/\.m?js$/i.test(file)) return false;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  if (!((start === end && (start === 1 || start === 2)) || (end - start + 1 <= 2 && start <= 2))) {
    return false;
  }
  return !hasMinifiedAnchor(row);
});

if (unanchoredMinifiedEvidence.length > 0 && !hasAudit()) {
  failures.push(
    `Found ${unanchoredMinifiedEvidence.length} privacy/risk evidence review row(s) pointing to minified one-line JS ranges like 1-1 or 2-2 without an anchor/snippet/offset/context. Add anchors to privacy_risk_evidence_review.csv or justify in census/privacy_risk_audit.md.`
  );
}

function finish() {
  if (warnings.length > 0) {
    console.warn("Privacy/risk lint warnings:");
    warnings.forEach((w) => console.warn(`- ${w}`));
  }
  if (failures.length > 0) {
    console.error("Privacy/risk lint failed:");
    failures.forEach((f) => console.error(`- ${f}`));
    process.exit(1);
  }
  console.log(
    `Privacy/risk lint passed: ${privacyItems.length} privacy item(s), ${risks.length} risk(s), ${endpoints.length} endpoint(s), ${messages.length} message(s), ${storage.length} storage key(s), ${workflows.length} workflow(s).`
  );
}

finish();
