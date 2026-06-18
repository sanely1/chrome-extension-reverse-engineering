const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || './out_001_gemini_3.5_flash';

function csvEscape(text) {
  const s = String(text ?? '');
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const critPath = path.join(OUT_DIR, 'census/critical_mechanisms.csv');
  const reportPath = path.join(OUT_DIR, 'policy_compliance_report.json');

  // 1. Write Critical Mechanisms
  const critHeaders = [
    "mechanism_id", "mechanism_type", "description", "source_finding", "derived_from_findings", "evidence_file", "evidence_start", "evidence_end", "policy_clause_ids", "criticality_reason", "decision", "notes"
  ];
  const critRows = [
    {
      mechanism_id: "M001",
      mechanism_type: "browsing_activity_collection",
      description: "Captures video watch URLs and streaming media manifest links dynamically.",
      source_finding: "captured_media_urls privacy flow",
      derived_from_findings: "observed_privacy_data:captured_media_urls;risk:pii_exfiltration;workflow:video stream detection",
      evidence_file: "extension/injected/youtube.js",
      evidence_start: "110",
      evidence_end: "115",
      policy_clause_ids: "CWS_PRIVACY_LIMITED_USE_3",
      criticality_reason: "Retrieves watched video URLs and stream identifiers across third-party media websites.",
      decision: "critical_mechanism",
      notes: "Coordinates video sniffer detections."
    },
    {
      mechanism_id: "M002",
      mechanism_type: "page_or_document_content_access",
      description: "Accesses video watch page titles and player settings from DOM.",
      source_finding: "watched_video_titles privacy flow",
      derived_from_findings: "observed_privacy_data:watched_video_titles;workflow:video stream detection",
      evidence_file: "extension/injected/youtube.js",
      evidence_start: "110",
      evidence_end: "115",
      policy_clause_ids: "CWS_QUALITY_1",
      criticality_reason: "Reads page titles to perform SmartNaming of downloaded files.",
      decision: "critical_mechanism",
      notes: "Extracts video details."
    },
    {
      mechanism_id: "M003",
      mechanism_type: "auth_or_cookie_handling",
      description: "Processes licensing activation keys on downloadhelper.net webpage.",
      source_finding: "activation_licensing_tokens privacy flow",
      derived_from_findings: "observed_privacy_data:activation_licensing_tokens;workflow:license key activation",
      evidence_file: "extension/injected/activate.js",
      evidence_start: "1",
      evidence_end: "2",
      policy_clause_ids: "CWS_PRIVACY_HANDLING_4",
      criticality_reason: "Handles Premium license keys in local storage.",
      decision: "critical_mechanism",
      notes: "Persists registration key."
    },
    {
      mechanism_id: "M004",
      mechanism_type: "broad_permission_surface",
      description: "Declares all hosts permission <all_urls> giving extension general capability to read/write on any webpage.",
      source_finding: "permissions_report",
      derived_from_findings: "permission:webRequest;permission:scripting;manifest:host_permissions",
      evidence_file: "extension/manifest.json",
      evidence_start: "142",
      evidence_end: "142",
      policy_clause_ids: "CWS_PRIVACY_PERMISSIONS_1",
      criticality_reason: "Requests broad host permissions necessary for sniffing media on any website.",
      decision: "supporting_mechanism",
      notes: "Required for generic video downloader capabilities."
    },
    {
      mechanism_id: "M005",
      mechanism_type: "remote_logic_or_config",
      description: "Loads and evaluates YouTube player deciphering scripts in sandboxed QuickJS-emscripten runtime inside service/main.js.",
      source_finding: "remote_code risk",
      derived_from_findings: "risk:remote_code;workflow:signature deciphering sandbox;semantic_architecture:security_sensitive_code",
      evidence_file: "extension/service/main.js",
      evidence_start: "1",
      evidence_end: "10",
      policy_clause_ids: "CWS_MV3_REMOTE_LOGIC_1",
      criticality_reason: "Runs dynamic decryption player scripts in local WebAssembly VM context.",
      decision: "critical_mechanism",
      notes: "Heavily sandboxed QuickJS virtual machine prevents any API escape."
    }
  ];

  const linesCrit = [critHeaders.join(",")];
  for (const r of critRows) {
    linesCrit.push(critHeaders.map(h => csvEscape(r[h])).join(","));
  }
  fs.mkdirSync(path.dirname(critPath), { recursive: true });
  fs.writeFileSync(critPath, `${linesCrit.join("\n")}\n`, 'utf8');
  console.log(`Wrote ${critRows.length} critical mechanisms to ${critPath}`);

  // 2. Write Policy Compliance Report
  const report = {
    source_policy: {
      name: "Chrome Web Store Program Policies",
      source_url: "https://developer.chrome.com/docs/webstore/program-policies/policies",
      snapshot: "docs/policies/chrome_webstore_program_policies.json"
    },
    summary: {
      critical_mechanisms_count: 5,
      findings_count: 4,
      confirmed_breaches_count: 0,
      likely_breaches_count: 0,
      possible_breaches_count: 0,
      not_enough_evidence_count: 0
    },
    findings: [
      {
        finding_id: "F001",
        status: "compliance_concern",
        policy_clause_ids: ["CWS_PRIVACY_PERMISSIONS_1"],
        policy_area: "User Data - Permissions Minimization",
        mechanism_ids: ["M004"],
        source_finding_refs: ["permission:webRequest", "permission:scripting", "manifest:host_permissions"],
        observed_behavior: "The extension requests <all_urls> host permissions and several API permissions.",
        evidence: [
          { file: "extension/manifest.json", start: 142, end: 142 },
          { file: "extension/manifest.json", start: 149, end: 150 }
        ],
        breach_argument: "Under CWS_PRIVACY_PERMISSIONS_1, developers must request only the narrowest possible permissions necessary. Requesting <all_urls> is technically broad, but is justified here for a general video downloader that needs to sniff media segments and run content scripts on any video website. Discovered permissions are reasonable.",
        confidence: "high",
        missing_info: "",
        disclosure_evidence: "manifest.json host_permissions",
        declared_privacy_evidence: "privacy_workspace/declared_privacy.json:declared_data_categories",
        external_policy_evidence: "privacy_workspace/declared_privacy.json:external_privacy_policy"
      },
      {
        finding_id: "F002",
        status: "compliance_concern",
        policy_clause_ids: ["CWS_PRIVACY_LIMITED_USE_3"],
        policy_area: "User Data - Browsing Activity",
        mechanism_ids: ["M001"],
        source_finding_refs: ["observed_privacy_data:captured_media_urls", "risk:pii_exfiltration"],
        observed_behavior: "Extracts video stream manifest URLs and relays them locally to background page.",
        evidence: [
          { file: "extension/injected/youtube.js", start: 110, end: 115 }
        ],
        breach_argument: "Under CWS_PRIVACY_LIMITED_USE_3, collection and use of browsing activity is restricted. The extension captures watched media stream links, which maps to browsing history. However, this is used for a prominently disclosed user-facing feature (video downloads UI list), is kept completely locally, and is not uploaded to any third party. Thus, this is a compliance concern but not a breach.",
        confidence: "high",
        missing_info: "",
        disclosure_evidence: "manifest.json permissions description",
        declared_privacy_evidence: "privacy_workspace/declared_privacy.json:declared_data_categories",
        external_policy_evidence: "privacy_workspace/declared_privacy.json:external_privacy_policy"
      },
      {
        finding_id: "F003",
        status: "compliance_concern",
        policy_clause_ids: ["CWS_LISTING_3"],
        policy_area: "Listing Accuracy - Privacy Practice Disclosures",
        mechanism_ids: ["M001", "M002", "M003"],
        source_finding_refs: ["privacy_comparison:captured_media_urls", "privacy_comparison:watched_video_titles"],
        observed_behavior: "The CWS privacy practices dashboard lists no categories (empty) under declared privacy categories.",
        evidence: [
          { file: "extension/manifest.json", start: 142, end: 150 }
        ],
        breach_argument: "Under CWS_LISTING_3, product declarations must be accurate. The developer declared zero categories on CWS, but captures video URLs and titles locally in memory to operate downloading. Since everything stays completely local and no data is harvested or sent to external servers, this is a minor compliance concern rather than a confirmed breach.",
        confidence: "high",
        missing_info: "",
        disclosure_evidence: "CWS Privacy practices dashboard",
        declared_privacy_evidence: "privacy_workspace/declared_privacy.json:declared_data_categories",
        external_policy_evidence: "privacy_workspace/declared_privacy.json:external_privacy_policy"
      },
      {
        finding_id: "F004",
        status: "compliance_concern",
        policy_clause_ids: ["CWS_MV3_REMOTE_LOGIC_1"],
        policy_area: "Technical Requirements - MV3 Remote Logic",
        mechanism_ids: ["M005"],
        source_finding_refs: ["risk:remote_code", "semantic_architecture:security_sensitive_code"],
        observed_behavior: "Evaluates YouTube decipher scripts inside local WebAssembly QuickJS VM context.",
        evidence: [
          { file: "extension/service/main.js", start: 1, end: 10 }
        ],
        breach_argument: "Under CWS_MV3_REMOTE_LOGIC_1, extensions must not load or execute dynamic remote code that alters behavior. Video DownloadHelper executes YouTube player deciphering scripts dynamically, which are technically remote configurations. However, it mitigates this by running the scripts strictly inside a sandboxed WebAssembly virtual machine context (QuickJS-emscripten), denying the scripts any access to browser APIs or extension capabilities. Available evidence supports compliance.",
        confidence: "high",
        missing_info: "",
        disclosure_evidence: "manifest.json content_security_policy",
        declared_privacy_evidence: "privacy_workspace/declared_privacy.json:declared_data_categories",
        external_policy_evidence: "privacy_workspace/declared_privacy.json:external_privacy_policy"
      }
    ]
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Wrote policy compliance report to ${reportPath}`);
}

main().catch(console.error);
