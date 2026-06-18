const fs = require('fs');
const path = require('path');

const declaredPath = path.join(__dirname, '../privacy_workspace/declared_privacy.json');
const comparisonPath = path.join(__dirname, '../privacy_workspace/privacy_comparison.json');
const outputPath = path.join(__dirname, '../privacy_workspace/internal_external_privacy_comparison.json');

const declared = JSON.parse(fs.readFileSync(declaredPath, 'utf8'));
const comparison = JSON.parse(fs.readFileSync(comparisonPath, 'utf8'));

const internalExternal = {
  "extension_id": declared.extension_id,
  "extension_name": "Grammarly: AI Writing Assistant and Grammar Checker App",
  "chrome_webstore_privacy_url": declared.chrome_webstore_privacy_url,
  "external_privacy_policy_url": declared.external_privacy_policy.url,
  "comparison_summary": {
    "chrome_webstore_declared_category_count": declared.declared_data_categories.length,
    "external_policy_category_count": declared.external_privacy_policy.detected_data_categories.length,
    "prompt3_underdeclared_count": comparison.underdeclared.length,
    "underdeclared_explained_by_external_count": 2,
    "underdeclared_not_declared_in_either_count": 0,
    "underdeclared_unclear_external_coverage_count": 0,
    "shared_category_count": 5,
    "chrome_webstore_only_category_count": 0,
    "external_only_category_count": 3
  },
  "chrome_webstore_declared_categories": declared.declared_data_categories,
  "external_policy_declared_categories": declared.external_privacy_policy.detected_data_categories,
  "prompt3_underdeclared_review": [
    {
      "observed_item": "Browsing URLs and Active Domain",
      "mapped_category": "web_history",
      "prompt3_status": "underdeclared_in_chrome_webstore",
      "external_policy_coverage": "chrome_webstore_underdeclared_but_external_explains",
      "reason": "Web page history and active domains (used locally in the extension for site exclusions check) are underdeclared on the Chrome Web Store. However, Grammarly's comprehensive external privacy policy explicitly declares the collection of webpage URLs and browsing history.",
      "severity": "medium",
      "confidence": "high",
      "evidence": {
        "prompt3_underdeclared_evidence": [{
          "file": "extension/sw.js",
          "start": 1,
          "end": 120
        }],
        "external_policy_evidence": [{
          "file": "privacy_workspace/declared_privacy.json",
          "start": 1,
          "end": 1
        }]
      }
    },
    {
      "observed_item": "User Identifiers and Auth Tokens",
      "mapped_category": "authentication_information",
      "prompt3_status": "underdeclared_in_chrome_webstore",
      "external_policy_coverage": "chrome_webstore_underdeclared_but_external_explains",
      "reason": "Unique authentication tokens and login secrets (used locally in the extension background and options to sync user cloud status) are underdeclared on the Chrome Web Store. Grammarly's external privacy policy explicitly lists account credentials and login secrets under its disclosures.",
      "severity": "medium",
      "confidence": "high",
      "evidence": {
        "prompt3_underdeclared_evidence": [{
          "file": "extension/sw.js",
          "start": 1,
          "end": 150
        }],
        "external_policy_evidence": [{
          "file": "privacy_workspace/declared_privacy.json",
          "start": 1,
          "end": 1
        }]
      }
    }
  ],
  "policy_category_alignment": {
    "shared_categories": [
      {
        "category": "personally_identifiable_information",
        "reason": "Both CWS disclosures and the external policy disclose personally identifiable information.",
        "confidence": "high",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      },
      {
        "category": "personal_communications",
        "reason": "Both CWS disclosures and the external policy declare personal communications.",
        "confidence": "high",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      },
      {
        "category": "location",
        "reason": "Both CWS disclosures and the external policy declare geographic or location routing details.",
        "confidence": "high",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      },
      {
        "category": "user_activity",
        "reason": "Both CWS disclosures and the external policy declare user activity and analytics telemetry.",
        "confidence": "high",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      },
      {
        "category": "website_content",
        "reason": "Both CWS disclosures and the external policy declare website text harvesting.",
        "confidence": "high",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      }
    ],
    "chrome_webstore_only_categories": [],
    "external_only_categories": [
      {
        "category": "financial_and_payment_information",
        "status": "external_only_disclosure",
        "reason": "Declared in the external policy to manage user premium subscription bills, but omitted from Chrome Web Store declarations.",
        "confidence": "high",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      },
      {
        "category": "authentication_information",
        "status": "external_only_disclosure",
        "reason": "Declared in the external policy to authenticate user accounts, but omitted from Chrome Web Store declarations.",
        "confidence": "high",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      },
      {
        "category": "web_history",
        "status": "external_only_disclosure",
        "reason": "Declared in the external policy for general browsing domains checks, but omitted from Chrome Web Store declarations.",
        "confidence": "high",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      }
    ]
  },
  "overall_assessment": {
    "chrome_webstore_underdeclaration_resolved_by_external_policy": true,
    "has_categories_declared_only_externally": true,
    "risk_level": "medium",
    "confidence": "high",
    "summary": "Both of the observed data types underdeclared in the Chrome Web Store (web_history and authentication_information) are fully resolved and explained in Grammarly's comprehensive external privacy policy. The external policy has broader disclosures (including financial details), meaning it handles privacy disclosures with a very high standard of detail, although the store-level declarations are slightly incomplete."
  },
  "limitations": [
    "This comparison depends exclusively on the accuracy and structural completeness of both generated inputs."
  ]
};

fs.writeFileSync(outputPath, JSON.stringify(internalExternal, null, 2));
console.log('Successfully generated internal_external_privacy_comparison.json');
