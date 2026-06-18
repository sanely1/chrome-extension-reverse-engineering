#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const outDir = process.argv[2];

if (!outDir) {
  console.error("Usage: node tools/policy_compliance_linter.js OUT_DIR");
  process.exit(2);
}

const projectRoot = path.resolve(__dirname, "..");
const policyPath = path.join(projectRoot, "docs", "policies", "chrome_webstore_program_policies.json");
const mappingPath = path.join(projectRoot, "docs", "policies", "policy_signal_mapping.json");
const summaryPath = path.join(outDir, "extension_summary.json");
const mechanismsPath = path.join(outDir, "census", "critical_mechanisms.csv");
const reportPath = path.join(outDir, "policy_compliance_report.json");

const failures = [];
const warnings = [];

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    failures.push(`Cannot read ${label}: ${err.message}`);
    return null;
  }
}

function exists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
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

const policy = readJson(policyPath, "docs/policies/chrome_webstore_program_policies.json");
readJson(mappingPath, "docs/policies/policy_signal_mapping.json");
const summary = readJson(summaryPath, "extension_summary.json");
const report = readJson(reportPath, "policy_compliance_report.json");

const clauseIds = new Set((policy && Array.isArray(policy.clauses) ? policy.clauses : []).map((c) => c.id));
const requiredPolicyIds = [
  "CWS_PRIVACY_POLICY_1",
  "CWS_PRIVACY_POLICY_2A",
  "CWS_PRIVACY_POLICY_2B",
  "CWS_PRIVACY_LIMITED_USE_3",
  "CWS_PRIVACY_LIMITED_USE_4_1",
  "CWS_PRIVACY_LIMITED_USE_4_2A",
  "CWS_PRIVACY_LIMITED_USE_4_4A",
  "CWS_PRIVACY_PERMISSIONS_1",
  "CWS_PRIVACY_DISCLOSURE_1",
  "CWS_PRIVACY_DISCLOSURE_2A",
  "CWS_PRIVACY_HANDLING_2",
  "CWS_PRIVACY_HANDLING_4",
  "CWS_MALICIOUS_3",
  "CWS_MISLEADING_3",
  "CWS_ADS_8A",
  "CWS_AFFILIATE_3B",
  "CWS_LISTING_3",
  "CWS_QUALITY_1",
  "CWS_TECH_READABILITY_1",
  "CWS_MV3_REMOTE_LOGIC_1",
  "CWS_MV3_REMOTE_LOGIC_1B",
  "CWS_MV3_REMOTE_COMM_3B",
];
const missingRequiredPolicyIds = requiredPolicyIds.filter((id) => !clauseIds.has(id));
if (missingRequiredPolicyIds.length) {
  failures.push(`Structured policy file is missing required analysis clause ID(s): ${missingRequiredPolicyIds.join(", ")}`);
}

if (!exists(mechanismsPath)) {
  failures.push("Missing census/critical_mechanisms.csv from Step 12.");
}

let mechanisms = [];
if (exists(mechanismsPath)) {
  mechanisms = parseCsv(fs.readFileSync(mechanismsPath, "utf8"));
  const requiredHeaders = ["mechanism_id", "mechanism_type", "description", "source_finding", "derived_from_findings", "evidence_file", "evidence_start", "evidence_end", "policy_clause_ids", "criticality_reason", "decision"];
  const headers = mechanisms.length ? Object.keys(mechanisms[0]) : [];
  const missing = requiredHeaders.filter((h) => !headers.includes(h));
  if (missing.length) failures.push(`critical_mechanisms.csv missing required column(s): ${missing.join(", ")}`);
  for (const row of mechanisms) {
    const ids = String(row.policy_clause_ids || "").split(/[;|]/).map((v) => v.trim()).filter(Boolean);
    for (const id of ids) {
      if (!clauseIds.has(id)) failures.push(`critical_mechanisms.csv references unknown policy clause id: ${id}`);
    }
    const decision = String(row.decision || "").toLowerCase();
    const derived = String(row.derived_from_findings || "").trim();
    if (["critical_mechanism", "supporting_mechanism"].includes(decision) && !derived) {
      failures.push(`critical_mechanisms.csv row ${row.mechanism_id || "(unknown)"} is ${decision} but has empty derived_from_findings.`);
    }
    if (derived && !/(observed_privacy_data|risk|workflow|endpoint|message|storage|permission|semantic_architecture|privacy_comparison|external_policy_comparison|manifest):/i.test(derived)) {
      warnings.push(`critical_mechanisms.csv row ${row.mechanism_id || "(unknown)"} has derived_from_findings without a recognized source prefix.`);
    }
  }
}

const allowedStatuses = new Set([
  "confirmed_breach",
  "likely_breach",
  "possible_breach",
  "compliance_concern",
  "not_enough_evidence",
  "not_applicable",
]);

if (report) {
  if (!Array.isArray(report.findings)) {
    failures.push("policy_compliance_report.json must contain a findings array.");
  } else {
    for (const [index, finding] of report.findings.entries()) {
      const status = String(finding.status || "");
      if (!allowedStatuses.has(status)) {
        failures.push(`policy_compliance_report.json findings[${index}] has invalid status: ${status || "(empty)"}`);
      }
      const ids = Array.isArray(finding.policy_clause_ids) ? finding.policy_clause_ids : [];
      if (!ids.length) failures.push(`policy_compliance_report.json findings[${index}] has no policy_clause_ids.`);
      for (const id of ids) {
        if (!clauseIds.has(id)) failures.push(`policy_compliance_report.json findings[${index}] references unknown policy clause id: ${id}`);
      }
      if (!finding.observed_behavior || !finding.breach_argument) {
        failures.push(`policy_compliance_report.json findings[${index}] must include observed_behavior and breach_argument.`);
      }
      const refs = Array.isArray(finding.source_finding_refs) ? finding.source_finding_refs : [];
      if (!refs.length && status !== "not_applicable") {
        failures.push(`policy_compliance_report.json findings[${index}] has no source_finding_refs.`);
      }
      if (refs.some((ref) => !/(observed_privacy_data|risk|workflow|endpoint|message|storage|permission|semantic_architecture|privacy_comparison|external_policy_comparison|manifest):/i.test(String(ref)))) {
        warnings.push(`policy_compliance_report.json findings[${index}] contains source_finding_refs without recognized source prefixes.`);
      }
      const evidence = Array.isArray(finding.evidence) ? finding.evidence : [];
      if (!evidence.length && status !== "not_applicable") {
        failures.push(`policy_compliance_report.json findings[${index}] lacks source evidence.`);
      }
      const argument = String(finding.breach_argument || "");
      const hasAbsoluteComplianceClaim = /\b(fully compliant|fully conforms|this is compliant|is compliant|100%\s+consistent|no\s+violation)\b/i.test(argument);
      const hasFullSupport =
        Boolean(finding.disclosure_evidence) &&
        (Boolean(finding.declared_privacy_evidence) || Boolean(finding.external_policy_evidence));
      if (hasAbsoluteComplianceClaim && !hasFullSupport) {
        failures.push(`policy_compliance_report.json findings[${index}] uses absolute compliance language without disclosure plus declaration/policy evidence.`);
      }
      if (status === "confirmed_breach") {
        const hasDisclosureEvidence = Boolean(finding.disclosure_evidence || finding.declared_privacy_evidence || finding.external_policy_evidence);
        if (!hasDisclosureEvidence) {
          failures.push(`policy_compliance_report.json findings[${index}] is confirmed_breach without disclosure/declaration/policy evidence. Use likely/possible/not_enough_evidence unless the conflict is fully evidenced.`);
        }
      }
    }
  }
}

if (summary) {
  const pc = summary.policy_compliance;
  if (!pc || typeof pc !== "object") {
    warnings.push("extension_summary.json has no top-level policy_compliance summary object.");
  } else {
    if (!pc.report) failures.push("extension_summary.json policy_compliance.report is missing.");
    if (!pc.source_snapshot) failures.push("extension_summary.json policy_compliance.source_snapshot is missing.");
  }
}

if (failures.length) {
  console.error("[policy-compliance-linter] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  for (const warning of warnings) console.error(`warning: ${warning}`);
  process.exit(1);
}

console.log("[policy-compliance-linter] OK");
for (const warning of warnings) console.log(`warning: ${warning}`);
