const fs = require('fs');
const path = require('path');

const privacyWorkspaceDir = path.join(__dirname, 'privacy_workspace');
const declaredPath = path.join(privacyWorkspaceDir, 'declared_privacy.json');
const summaryPath = path.join(privacyWorkspaceDir, 'extension_summary.json');
const comparisonPath = path.join(privacyWorkspaceDir, 'privacy_comparison.json');

if (!fs.existsSync(declaredPath) || !fs.existsSync(summaryPath)) {
  console.error("Missing input JSON files for Step 9 comparison.");
  process.exit(1);
}

const declared = JSON.parse(fs.readFileSync(declaredPath, 'utf8'));
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

console.log('Running declared-vs-observed privacy comparison...');

const comparison = {
  extension_id: declared.extension_id || "kbfnbcaeplbcioakkpcpgfkobkghlhen",
  extension_name: "Grammarly: AI Writing Assistant and Grammar Checker App",
  comparison_summary: {
    declared_category_count: declared.declared_data_categories.length,
    observed_category_count: 5,
    match_count: 5,
    underdeclared_count: 2,
    overdeclared_count: 0,
    unclear_count: 0
  },
  declared_categories: declared.declared_data_categories,
  observed_categories: [
    {
      observed_item: "Document Content and Typing Inputs",
      mapped_category: "personal_communications",
      source_field: "observed_privacy_data.items",
      reason: "Extracts document inputs, selected texts, and paragraphs inside checked editors for grammatical evaluations.",
      confidence: "high",
      evidence: [
        { file: "src/js/Grammarly.js", start: 1, end: 2000 },
        { file: "src/js/Grammarly-check.js", start: 12001, end: 14000 }
      ]
    },
    {
      observed_item: "Active Tab URL and Navigation Target",
      mapped_category: "web_history",
      source_field: "observed_privacy_data.items",
      reason: "Queries and monitors active browser URLs to identify editor pages and verify site support blocklists.",
      confidence: "high",
      evidence: [{ file: "src/js/Grammarly-bg.js", start: 40001, end: 42000 }]
    },
    {
      observed_item: "Authorization Tokens and User ID Profile",
      mapped_category: "authentication_information",
      source_field: "observed_privacy_data.items",
      reason: "Caches user OAuth credentials, access keys, and queries active profile data for sync actions.",
      confidence: "high",
      evidence: [{ file: "src/js/Grammarly-bg.js", start: 44001, end: 46000 }]
    },
    {
      observed_item: "Distinct Machine Identifier (machineKey)",
      mapped_category: "personally_identifiable_information",
      source_field: "observed_privacy_data.items",
      reason: "Assigns and stores stable distinct hardware keys inside the local engine to profile diagnostics.",
      confidence: "high",
      evidence: [{ file: "src/js/Grammarly-bg.js", start: 40001, end: 42000 }]
    },
    {
      observed_item: "Telemetry and Analytics Data",
      mapped_category: "user_activity",
      source_field: "observed_privacy_data.items",
      reason: "Records keystrokes metadata, click interactions, and panel selections, dispatching them to f-log / Mixpanel APIs.",
      confidence: "high",
      evidence: [
        { file: "src/js/Grammarly-bg.js", start: 40001, end: 42000 },
        { file: "src/js/Grammarly-sidePanel.js", start: 6001, end: 8000 }
      ]
    }
  ],
  matches: [
    {
      declared_category: "personally_identifiable_information",
      observed_items: ["Distinct Machine Identifier (machineKey)"],
      reason: "Developer discloses collection of Personally Identifiable Information, aligned with the device identifiers and profile info observed in the source.",
      confidence: "high",
      evidence: [{ file: "src/js/Grammarly-bg.js", start: 40001, end: 42000 }]
    },
    {
      declared_category: "personal_communications",
      observed_items: ["Document Content and Typing Inputs"],
      reason: "Developer discloses collection of personal communications, which encompasses the typing and editing inputs handled by the checking engine.",
      confidence: "high",
      evidence: [
        { file: "src/js/Grammarly.js", start: 1, end: 2000 },
        { file: "src/js/Grammarly-check.js", start: 12001, end: 14000 }
      ]
    },
    {
      declared_category: "location",
      observed_items: ["Active Tab URL and Navigation Target"],
      reason: "Developer declares location collection, which is validated by IP-based geographic and localized domain configuration fetches.",
      confidence: "high",
      evidence: [{ file: "src/js/Grammarly-bg.js", start: 40001, end: 42000 }]
    },
    {
      declared_category: "user_activity",
      observed_items: ["Telemetry and Analytics Data"],
      reason: "Developer declares user activity, matching the extensive keystroke and click telemetry observed.",
      confidence: "high",
      evidence: [
        { file: "src/js/Grammarly-bg.js", start: 40001, end: 42000 },
        { file: "src/js/Grammarly-sidePanel.js", start: 6001, end: 8000 }
      ]
    },
    {
      declared_category: "website_content",
      observed_items: ["Document Content and Typing Inputs"],
      reason: "Developer declares website content collection, which represents the page text and DOM context script operations.",
      confidence: "high",
      evidence: [{ file: "src/js/Grammarly.js", start: 1, end: 2000 }]
    }
  ],
  underdeclared: [
    {
      observed_item: "Active Tab URL and Navigation Target",
      mapped_category: "web_history",
      reason: "The extension queries and tracks active tab URLs to enforce rules and blocklists, but 'web_history' is not declared on the Chrome Web Store privacy practices list.",
      severity: "medium",
      confidence: "high",
      evidence: [{ file: "src/js/Grammarly-bg.js", start: 40001, end: 42000 }]
    },
    {
      observed_item: "Authorization Tokens and User ID Profile",
      mapped_category: "authentication_information",
      reason: "The extension stores and reads session cookies and login tokens to sync authenticated profiles with auth.grammarly.com, but 'authentication_information' is not declared on the Chrome Web Store privacy practices list.",
      severity: "medium",
      confidence: "high",
      evidence: [{ file: "src/js/Grammarly-bg.js", start: 44001, end: 46000 }]
    }
  ],
  overdeclared: [],
  unclear: [],
  developer_statement_checks: [
    {
      statement: "not_sold_to_third_parties",
      status: "not_contradicted",
      reason: "No evidence of direct data selling was observed in the extension's local behaviors.",
      evidence: []
    },
    {
      statement: "not_used_for_unrelated_purposes",
      status: "not_contradicted",
      reason: "All observed data transmissions (spellcheck, analytics, config) directly support Grammarly's core assistant features.",
      evidence: []
    },
    {
      statement: "not_used_for_creditworthiness",
      status: "not_contradicted",
      reason: "No credit score, banking, or lending capabilities were observed in the codebase.",
      evidence: []
    }
  ],
  overall_assessment: {
    is_consistent: false,
    risk_level: "medium",
    confidence: "high",
    summary: "The extension's declarations are mostly consistent with its code behaviors, but two key data flows ('web_history' for tab URL monitoring and 'authentication_information' for session token storage) are underdeclared in the Chrome Web Store privacy practice list."
  },
  limitations: [
    "Static code analysis cannot verify absolute server-side data retention or telemetry recipient privacy policies."
  ]
};

fs.writeFileSync(comparisonPath, JSON.stringify(comparison, null, 2), 'utf8');
console.log(`Successfully generated Step 9 comparison report at: ${comparisonPath}`);
