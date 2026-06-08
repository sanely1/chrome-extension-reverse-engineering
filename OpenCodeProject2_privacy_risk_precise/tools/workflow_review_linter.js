#!/usr/bin/env node
/*
 * Workflow review linter.
 *
 * Usage:
 *   node tools/workflow_review_linter.js OUT_DIR
 *
 * This is intentionally generic: it does not know specific extensions.
 * It checks whether the final workflow list is plausible given the
 * reviewed endpoint/message/storage/component signal volume.
 */
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(process.cwd(), process.argv[2] || './out_census');
const summaryPath = path.join(outDir, 'extension_summary.json');
const reviewPath = path.join(outDir, 'census', 'workflow_candidate_review.csv');
const auditPath = path.join(outDir, 'census', 'workflow_promotion_audit.md');

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

function lowerJson(value) {
  return JSON.stringify(value || '').toLowerCase();
}

function count(arr) {
  return Array.isArray(arr) ? arr.length : 0;
}

const CATEGORY_RULES = [
  {
    name: 'auth/account/session',
    signal: /\b(auth|oauth|identity|login|logout|account|profile|user|session|token|cookie|credential|subscription|premium)\b/i,
    workflow: /\b(auth|oauth|identity|login|logout|account|profile|user|session|token|cookie|credential|subscription|premium)\b/i
  },
  {
    name: 'telemetry/analytics/errors',
    signal: /\b(telemetry|analytics|metric|metrics|event|track|tracking|log|logger|gnar|sentry|femetrics|diagnostic|error|crash|beacon|alarm)\b/i,
    workflow: /\b(telemetry|analytics|metric|event|track|log|logger|diagnostic|error|crash|beacon|alarm)\b/i
  },
  {
    name: 'config/feature flags/experiments',
    signal: /\b(config|configuration|feature|flag|experiment|abtest|treatment|gate|gates|dynamic|managed|policy|settings)\b/i,
    workflow: /\b(config|configuration|feature|flag|experiment|abtest|treatment|gate|managed|policy|settings)\b/i
  },
  {
    name: 'ui/popup/options/sidepanel',
    signal: /\b(popup|option|options|sidepanel|side_panel|panel|ui|widget|overlay|browseraction|action\.|notification|command|contextmenu)\b/i,
    workflow: /\b(popup|option|sidepanel|panel|ui|widget|overlay|notification|command|context menu|browser action)\b/i
  },
  {
    name: 'content/page interaction',
    signal: /\b(content_script|content script|dom|document|text|selection|input|textarea|page|tab|url|location|mutationobserver|metadata|form|editable)\b/i,
    workflow: /\b(content|dom|document|text|selection|input|page|tab|url|metadata|form|editable|writing|grammar)\b/i
  },
  {
    name: 'storage/cache/persistence',
    signal: /\b(storage|localstorage|sessionstorage|indexeddb|cache|cookie|persist|sync|managed|store|database)\b/i,
    workflow: /\b(storage|localstorage|sessionstorage|indexeddb|cache|cookie|persist|sync|managed|store|database)\b/i
  },
  {
    name: 'external bridge/native/frame messaging',
    signal: /\b(postmessage|iframe|frame|bridge|external|native|nativemessaging|port|connect|worker|sharedworker)\b/i,
    workflow: /\b(postmessage|iframe|frame|bridge|external|native|port|worker|message)\b/i
  },
  {
    name: 'text/document/media processing',
    signal: /\b(rewrite|grammar|spell|proof|ai|chat|document|report|upload|file|image|media|canvas|ocr|summar|translate)\b/i,
    workflow: /\b(rewrite|grammar|spell|proof|ai|chat|document|report|upload|file|image|media|canvas|translate)\b/i
  },
  {
    name: 'lifecycle/install/startup',
    signal: /\b(install|installed|update|startup|oninstalled|onstartup|onboarding|uninstall|activate|initialize|init)\b/i,
    workflow: /\b(install|update|startup|onboarding|uninstall|activate|initialize|init|lifecycle)\b/i
  }
];

function main() {
  const failures = [];
  const warnings = [];

  if (!fs.existsSync(summaryPath)) {
    failures.push(`Missing extension_summary.json: ${summaryPath}`);
  }

  if (!fs.existsSync(reviewPath)) {
    failures.push(`Missing required workflow adjudication file: ${reviewPath}`);
  } else {
    const review = parseCsv(fs.readFileSync(reviewPath, 'utf8'));
    const bad = review.filter((r) => !/^(confirmed_workflow|likely_workflow|merged_workflow|rejected_candidate|uncertain_candidate)$/.test(r.decision || ''));
    if (bad.length) failures.push(`workflow_candidate_review.csv has ${bad.length} row(s) with invalid decision values`);
    const confirmed = review.filter((r) => /^(confirmed_workflow|likely_workflow)$/.test(r.decision || '')).length;
    if (confirmed >= 6) warnings.push(`workflow review contains ${confirmed} confirmed/likely candidates; final workflows should preserve that breadth unless merged with audit reasons`);
  }

  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    const endpoints = summary.network && Array.isArray(summary.network.endpoints) ? summary.network.endpoints : [];
    const messages = summary.messaging && Array.isArray(summary.messaging.channels) ? summary.messaging.channels : [];
    const storage = summary.storage && Array.isArray(summary.storage.keys) ? summary.storage.keys : [];
    const workflows = Array.isArray(summary.workflows) ? summary.workflows : [];
    const components = summary.components || {};
    const permissions = summary.permissions || {};

    const signalText = lowerJson({ endpoints, messages, storage, components, permissions });
    const workflowText = lowerJson(workflows);
    const hasAudit = fs.existsSync(auditPath);

    const largeSignalVolume = endpoints.length >= 80 || messages.length >= 60 || storage.length >= 12;
    const veryLargeSignalVolume = endpoints.length >= 200 || messages.length >= 120;

    if (veryLargeSignalVolume && workflows.length < 6 && !hasAudit) {
      failures.push(`Only ${workflows.length} workflows for a very large signal set (endpoints=${endpoints.length}, messages=${messages.length}, storage=${storage.length}). Add workflows or write census/workflow_promotion_audit.md with concrete merge/rejection reasons.`);
    } else if (largeSignalVolume && workflows.length < 5 && !hasAudit) {
      failures.push(`Only ${workflows.length} workflows for a large signal set (endpoints=${endpoints.length}, messages=${messages.length}, storage=${storage.length}). Add workflows or write census/workflow_promotion_audit.md with concrete merge/rejection reasons.`);
    }

    const missingCategories = [];
    for (const rule of CATEGORY_RULES) {
      if (rule.signal.test(signalText) && !rule.workflow.test(workflowText)) {
        missingCategories.push(rule.name);
      }
    }
    if (missingCategories.length) {
      const msg = `Signals exist but workflows do not cover these generic categories: ${missingCategories.join(', ')}`;
      if (hasAudit) warnings.push(`${msg}. Audit exists, verify it explains each omission.`);
      else failures.push(`${msg}. Add workflows or document precise rejection/merge reasons in workflow_promotion_audit.md.`);
    }

    const names = workflows.map((w) => String(w.name || '').toLowerCase());
    const genericNames = names.filter((n) => /^(workflow|main workflow|core workflow|general workflow|extension workflow)$/.test(n));
    if (genericNames.length) failures.push(`Workflow names are too generic: ${genericNames.join(', ')}`);

    const weak = workflows.filter((w) => {
      const steps = Array.isArray(w.steps) ? w.steps.length : 0;
      const evidence = Array.isArray(w.evidence) ? w.evidence.length : 0;
      const linked = count(w.messages) + count(w.endpoints) + count(w.storage_keys) + count(w.apis);
      return steps < 2 || evidence < 1 || linked < 1;
    });
    if (weak.length) failures.push(`${weak.length} workflow(s) lack minimum steps/evidence/linked signals`);
  }

  if (failures.length) {
    console.error('[workflow-review-linter] FAIL');
    for (const f of failures) console.error(`- ${f}`);
    for (const w of warnings) console.error(`warning: ${w}`);
    process.exit(1);
  }

  console.log('[workflow-review-linter] OK');
  for (const w of warnings) console.log(`warning: ${w}`);
}

main();
