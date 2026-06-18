const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || './out_001_gemini_3.5_flash';
const WORKSPACE = './privacy_workspace';

async function main() {
  const summaryPath = path.join(OUT_DIR, 'extension_summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.error("extension_summary.json is missing!");
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  summary.policy_compliance = {
    source: "Chrome Web Store Program Policies",
    source_url: "https://developer.chrome.com/docs/webstore/program-policies/policies",
    source_snapshot: "docs/policies/chrome_webstore_program_policies.json",
    report: "policy_compliance_report.json",
    critical_mechanisms_count: 5,
    possible_breaches_count: 0,
    confirmed_breaches_count: 0,
    notes: "Detailed policy analysis is in policy_compliance_report.json."
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Updated policy_compliance in ${summaryPath}`);

  // Copy to workspace
  const workspacePath = path.join(WORKSPACE, 'extension_summary.json');
  fs.mkdirSync(WORKSPACE, { recursive: true });
  fs.writeFileSync(workspacePath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Copied updated summary to ${workspacePath}`);
}

main().catch(console.error);
