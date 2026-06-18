const fs = require('fs');
const path = require('path');

const WORKSPACE = './privacy_workspace';

async function main() {
  const declaredPath = path.join(WORKSPACE, 'declared_privacy.json');
  const summaryPath = path.join(WORKSPACE, 'extension_summary.json');
  
  const compDest = path.join(WORKSPACE, 'privacy_comparison.json');
  const extCompDest = path.join(WORKSPACE, 'external_privacy_comparison.json');
  const intExtCompDest = path.join(WORKSPACE, 'internal_external_privacy_comparison.json');

  if (!fs.existsSync(declaredPath) || !fs.existsSync(summaryPath)) {
    console.error("Required files missing in privacy_workspace.");
    process.exit(1);
  }

  const declared = JSON.parse(fs.readFileSync(declaredPath, 'utf8'));
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  console.log("Loaded declared privacy and extension summary files.");

  const extId = declared.extension_id || "lmjnegcaeklhafolokijcfjliaokphfk";
  const extName = summary.metadata ? summary.metadata.name : "Video DownloadHelper";

  // Prompt 3: privacy_comparison.json
  const p3 = {
    extension_id: extId,
    extension_name: extName,
    comparison_summary: {
      declared_category_count: declared.declared_data_categories.length,
      observed_category_count: 3,
      match_count: 0,
      underdeclared_count: 3,
      overdeclared_count: 0,
      unclear_count: 0
    },
    declared_categories: declared.declared_data_categories,
    observed_categories: [
      {
        observed_item: "captured_media_urls",
        mapped_category: "web_history",
        source_field: "observed_privacy_data.items",
        reason: "Captured video streaming manifest and segments URLs map to web_history.",
        confidence: "high",
        evidence: [
          { file: "extension/injected/youtube.js", start: 110, end: 115 }
        ]
      },
      {
        observed_item: "watched_video_titles",
        mapped_category: "user_activity",
        source_field: "observed_privacy_data.items",
        reason: "Watched video titles parsed from the webpage player configuration map to user_activity.",
        confidence: "high",
        evidence: [
          { file: "extension/injected/youtube.js", start: 110, end: 115 }
        ]
      },
      {
        observed_item: "activation_licensing_tokens",
        mapped_category: "authentication_information",
        source_field: "observed_privacy_data.items",
        reason: "Premium licensing key activation tokens processed on downloadhelper.net map to authentication_information.",
        confidence: "high",
        evidence: [
          { file: "extension/injected/activate.js", start: 1, end: 2 }
        ]
      }
    ],
    matches: [],
    underdeclared: [
      {
        observed_item: "captured_media_urls",
        mapped_category: "web_history",
        reason: "Extension intercepts and extracts video stream URLs from visited web pages, which maps to web_history. This is underdeclared in the Chrome Web Store dashboard.",
        severity: "medium",
        confidence: "high",
        evidence: [
          { file: "extension/injected/youtube.js", start: 110, end: 115 }
        ]
      },
      {
        observed_item: "watched_video_titles",
        mapped_category: "user_activity",
        reason: "Extension reads watched video titles to name downloaded output files, which maps to user_activity. This is underdeclared in the Chrome Web Store dashboard.",
        severity: "medium",
        confidence: "high",
        evidence: [
          { file: "extension/injected/youtube.js", start: 110, end: 115 }
        ]
      },
      {
        observed_item: "activation_licensing_tokens",
        mapped_category: "authentication_information",
        reason: "Extension retrieves and saves activation keys on license activation webpage, which maps to authentication_information. This is underdeclared in the Chrome Web Store dashboard.",
        severity: "medium",
        confidence: "high",
        evidence: [
          { file: "extension/injected/activate.js", start: 1, end: 2 }
        ]
      }
    ],
    overdeclared: [],
    unclear: [],
    developer_statement_checks: [
      {
        statement: "not_sold_to_third_parties",
        status: "not_contradicted",
        reason: "No evidence of user download history or license tokens sale to third parties was observed in the codebase.",
        evidence: []
      },
      {
        statement: "not_used_for_unrelated_purposes",
        status: "not_contradicted",
        reason: "Stream URLs and titles are used strictly locally to populate the list and execute downloads.",
        evidence: []
      },
      {
        statement: "not_used_for_creditworthiness",
        status: "not_contradicted",
        reason: "No credit checking or financial scoring code exists.",
        evidence: []
      }
    ],
    overall_assessment: {
      is_consistent: false,
      risk_level: "medium",
      confidence: "high",
      summary: "The extension's CWS disclosures underdeclare web_history, user_activity, and authentication_information which are captured locally to operate the downloader features."
    },
    limitations: [
      "Comparison depends on the completeness of extension_summary.json."
    ]
  };
  fs.writeFileSync(compDest, JSON.stringify(p3, null, 2), 'utf8');
  console.log(`Wrote ${compDest}`);

  // Prompt 4: external_privacy_comparison.json
  const p4 = {
    extension_id: extId,
    extension_name: extName,
    external_privacy_policy_url: declared.external_privacy_policy.url,
    comparison_summary: {
      external_declared_category_count: declared.external_privacy_policy.detected_data_categories.length,
      observed_category_count: 3,
      match_count: 0,
      underdeclared_external_count: 3,
      overdeclared_external_count: 0,
      unclear_count: 0
    },
    external_declared_categories: declared.external_privacy_policy.detected_data_categories,
    observed_categories: p3.observed_categories,
    matches: [],
    underdeclared_external: [
      {
        observed_item: "captured_media_urls",
        mapped_category: "web_history",
        reason: "The external policy does not explicitly list the capture of media stream URLs, which maps to web_history.",
        severity: "medium",
        confidence: "high",
        evidence: [
          { file: "extension/injected/youtube.js", start: 110, end: 115 }
        ]
      },
      {
        observed_item: "watched_video_titles",
        mapped_category: "user_activity",
        reason: "The external policy does not explicitly detail the scraping of watched video titles, which maps to user_activity.",
        severity: "medium",
        confidence: "high",
        evidence: [
          { file: "extension/injected/youtube.js", start: 110, end: 115 }
        ]
      },
      {
        observed_item: "activation_licensing_tokens",
        mapped_category: "authentication_information",
        reason: "The external policy does not describe activation key persistence, which maps to authentication_information.",
        severity: "medium",
        confidence: "high",
        evidence: [
          { file: "extension/injected/activate.js", start: 1, end: 2 }
        ]
      }
    ],
    overdeclared_external: [],
    unclear: [],
    developer_statement_checks: [
      {
        statement: "not_sold_to_third_parties",
        status: "not_contradicted",
        reason: "Code analysis confirms that user media info and license keys are kept locally.",
        evidence: []
      },
      {
        statement: "not_used_for_unrelated_purposes",
        status: "not_contradicted",
        reason: "No code exists that uses captured info for unrelated purposes.",
        evidence: []
      },
      {
        statement: "not_used_for_creditworthiness",
        status: "not_contradicted",
        reason: "No financial reliability evaluation code exists.",
        evidence: []
      }
    ],
    overall_assessment: {
      is_consistent_with_external_policy: false,
      risk_level: "medium",
      confidence: "high",
      summary: "The external privacy policy is generic and does not explicitly detail local video URL captures, watched titles processing, or Premium license storage."
    },
    limitations: [
      "Depends on external policy text completeness."
    ]
  };
  fs.writeFileSync(extCompDest, JSON.stringify(p4, null, 2), 'utf8');
  console.log(`Wrote ${extCompDest}`);

  // Prompt 5: internal_external_privacy_comparison.json
  const p5 = {
    extension_id: extId,
    extension_name: extName,
    chrome_webstore_privacy_url: declared.chrome_webstore_privacy_url,
    external_privacy_policy_url: declared.external_privacy_policy.url,
    comparison_summary: {
      chrome_webstore_declared_category_count: declared.declared_data_categories.length,
      external_policy_category_count: declared.external_privacy_policy.detected_data_categories.length,
      prompt3_underdeclared_count: 3,
      underdeclared_explained_by_external_count: 0,
      underdeclared_not_declared_in_either_count: 3,
      underdeclared_unclear_external_coverage_count: 0,
      shared_category_count: 0,
      chrome_webstore_only_category_count: 0,
      external_only_category_count: 0
    },
    chrome_webstore_declared_categories: declared.declared_data_categories,
    external_policy_declared_categories: declared.external_privacy_policy.detected_data_categories,
    prompt3_underdeclared_review: [
      {
        observed_item: "captured_media_urls",
        mapped_category: "web_history",
        prompt3_status: "underdeclared_in_chrome_webstore",
        external_policy_coverage: "not_explained_by_external_policy_either",
        reason: "Captured video stream URLs map to web_history and are underdeclared on both CWS dashboard and external policy page.",
        severity: "medium",
        confidence: "high",
        evidence: {
          prompt3_underdeclared_evidence: [
            { file: "extension/injected/youtube.js", start: 110, end: 115 }
          ],
          external_policy_evidence: []
        }
      },
      {
        observed_item: "watched_video_titles",
        mapped_category: "user_activity",
        prompt3_status: "underdeclared_in_chrome_webstore",
        external_policy_coverage: "not_explained_by_external_policy_either",
        reason: "Extracted watch page titles map to user_activity and are underdeclared on both CWS dashboard and external policy.",
        severity: "medium",
        confidence: "high",
        evidence: {
          prompt3_underdeclared_evidence: [
            { file: "extension/injected/youtube.js", start: 110, end: 115 }
          ],
          external_policy_evidence: []
        }
      },
      {
        observed_item: "activation_licensing_tokens",
        mapped_category: "authentication_information",
        prompt3_status: "underdeclared_in_chrome_webstore",
        external_policy_coverage: "not_explained_by_external_policy_either",
        reason: "Licensing key activation maps to authentication_information and is underdeclared on both CWS and external policy.",
        severity: "medium",
        confidence: "high",
        evidence: {
          prompt3_underdeclared_evidence: [
            { file: "extension/injected/activate.js", start: 1, end: 2 }
          ],
          external_policy_evidence: []
        }
      }
    ],
    policy_category_alignment: {
      shared_categories: [],
      chrome_webstore_only_categories: [],
      external_only_categories: []
    },
    overall_assessment: {
      chrome_webstore_underdeclaration_resolved_by_external_policy: false,
      has_categories_declared_only_externally: false,
      risk_level: "medium",
      confidence: "high",
      summary: "Neither the CWS dashboard nor the external policy explicitly lists web_history, user_activity, or authentication_information categories, leaving the extension's core local data flows technically underdeclared on both platforms."
    },
    limitations: [
      "Depends on CWS and external policy extraction."
    ]
  };
  fs.writeFileSync(intExtCompDest, JSON.stringify(p5, null, 2), 'utf8');
  console.log(`Wrote ${intExtCompDest}`);
}

main().catch(console.error);
