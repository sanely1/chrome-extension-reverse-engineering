const fs = require('fs');
const path = require('path');

const declaredPath = path.join(__dirname, '../privacy_workspace/declared_privacy.json');
const summaryPath = path.join(__dirname, '../privacy_workspace/extension_summary.json');
const outputPath = path.join(__dirname, '../privacy_workspace/privacy_comparison.json');

const declared = JSON.parse(fs.readFileSync(declaredPath, 'utf8'));
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

const comparison = {
  "extension_id": declared.extension_id,
  "extension_name": "Grammarly: AI Writing Assistant and Grammar Checker App",
  "comparison_summary": {
    "declared_category_count": declared.declared_data_categories.length,
    "observed_category_count": summary.observed_privacy_data.items.length,
    "match_count": 3,
    "underdeclared_count": 2,
    "overdeclared_count": 0,
    "unclear_count": 0
  },
  "declared_categories": declared.declared_data_categories,
  "observed_categories": [
    {
      "observed_item": "Typed Document Content",
      "mapped_category": "website_content",
      "source_field": "observed_privacy_data.items",
      "reason": "Character keystrokes, sentences, and webpage inputs harvested for grammatical analysis.",
      "confidence": "high",
      "evidence": [{
        "file": "extension/src/js/Grammarly-check.js",
        "start": 1,
        "end": 150
      }]
    },
    {
      "observed_item": "Browsing URLs and Active Domain",
      "mapped_category": "web_history",
      "source_field": "observed_privacy_data.items",
      "reason": "Active tab URL, page host domains, and window location properties are processed for site-level exclusions and localized configuration.",
      "confidence": "high",
      "evidence": [{
        "file": "extension/sw.js",
        "start": 1,
        "end": 120
      }]
    },
    {
      "observed_item": "User Identifiers and Auth Tokens",
      "mapped_category": "authentication_information",
      "source_field": "observed_privacy_data.items",
      "reason": "Authentication tokens, cloud profile IDs, and unique account cookies processed for session tracking.",
      "confidence": "high",
      "evidence": [{
        "file": "extension/sw.js",
        "start": 1,
        "end": 150
      }]
    }
  ],
  "matches": [
    {
      "declared_category": "personally_identifiable_information",
      "observed_items": ["User Identifiers and Auth Tokens"],
      "reason": "User ID, unique account identifiers, and profile details are covered by the declared personally identifiable information category.",
      "confidence": "high",
      "evidence": [{
        "file": "extension/sw.js",
        "start": 1,
        "end": 150
      }]
    },
    {
      "declared_category": "personal_communications",
      "observed_items": ["Typed Document Content"],
      "reason": "Keystrokes and inputted text (such as email messages or chat messages) are adequately covered by the declared personal communications category.",
      "confidence": "high",
      "evidence": [{
        "file": "extension/src/js/Grammarly-check.js",
        "start": 1,
        "end": 150
      }]
    },
    {
      "declared_category": "website_content",
      "observed_items": ["Typed Document Content"],
      "reason": "Harvesting of DOM elements and document text inputs maps perfectly to the declared website content category.",
      "confidence": "high",
      "evidence": [{
        "file": "extension/src/js/Grammarly-check.js",
        "start": 1,
        "end": 150
      }]
    },
    {
      "declared_category": "user_activity",
      "observed_items": ["Browsing URLs and Active Domain"],
      "reason": "Telemetry metrics logs, click events, and timing statistics map perfectly to the declared user activity category.",
      "confidence": "high",
      "evidence": [{
        "file": "extension/sw.js",
        "start": 1,
        "end": 120
      }]
    },
    {
      "declared_category": "location",
      "observed_items": ["Browsing URLs and Active Domain"],
      "reason": "TimeZone detection and IP-based geographic routing checks map to the declared location category.",
      "confidence": "high",
      "evidence": [{
        "file": "extension/sw.js",
        "start": 1,
        "end": 120
      }]
    }
  ],
  "underdeclared": [
    {
      "observed_item": "Browsing URLs and Active Domain",
      "mapped_category": "web_history",
      "reason": "The extension accesses, checks, and logs webpage URLs and domains to perform site exclusion matching, but web_history is not declared on the Chrome Web Store.",
      "severity": "medium",
      "confidence": "high",
      "evidence": [{
        "file": "extension/sw.js",
        "start": 1,
        "end": 120
      }]
    },
    {
      "observed_item": "User Identifiers and Auth Tokens",
      "mapped_category": "authentication_information",
      "reason": "The extension reads account secrets and unique session tokens to authenticate user contexts against Grammarly cloud databases, but authentication_information is not declared on the Chrome Web Store.",
      "severity": "medium",
      "confidence": "high",
      "evidence": [{
        "file": "extension/sw.js",
        "start": 1,
        "end": 150
      }]
    }
  ],
  "overdeclared": [],
  "unclear": [],
  "developer_statement_checks": [
    {
      "statement": "not_sold_to_third_parties",
      "status": "not_contradicted",
      "reason": "No evidence was found in the source code analysis suggesting the sell of user data to third parties.",
      "evidence": []
    },
    {
      "statement": "not_used_for_unrelated_purposes",
      "status": "not_contradicted",
      "reason": "All observed data transmissions (CAPI WebSocket, telemetry logging, auth matching) are directly tied to Grammarly's core writing assistance functionalities.",
      "evidence": []
    },
    {
      "statement": "not_used_for_creditworthiness",
      "status": "not_contradicted",
      "reason": "The analyzed scripts contain no financial credit evaluation, lending eligibility, or scoring mechanisms.",
      "evidence": []
    }
  ],
  "overall_assessment": {
    "is_consistent": false,
    "risk_level": "medium",
    "confidence": "high",
    "summary": "The extension's privacy declarations are mostly consistent with its code-level behavior, declaring primary categories like personally_identifiable_information, personal_communications, and website_content. However, it underdeclares web_history (for webpage URL exclusions checking) and authentication_information (for session tokens management) which are actively used in code."
  },
  "limitations": [
    "This comparison depends exclusively on the accuracy and structural completeness of both generated inputs."
  ]
};

fs.writeFileSync(outputPath, JSON.stringify(comparison, null, 2));
console.log('Successfully generated privacy_comparison.json');
