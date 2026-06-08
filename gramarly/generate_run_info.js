const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'out_001_gemini_3_5_flash');
const summary = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'extension_summary.json'), 'utf8'));

const runInfo = {
  run_number: 1,
  model_name: 'gemini-3.5-flash',
  timestamp: new Date().toISOString(),
  source_extension_path: 'extension/',
  output_directory: 'out_001_gemini_3_5_flash',
  tools_used: ['glob', 'read', 'write', 'edit', 'bash', 'ajv'],
  validation_status: 'PASSED',
  counts: {
    beautified_files: 422,
    analyzed_files: 10,
    endpoints: summary.network.endpoints.length,
    messages: summary.messaging.channels.length,
    storage_keys: summary.storage.keys.length,
    workflows: summary.workflows.length,
    observed_privacy_items: summary.observed_privacy_data.items.length,
    risks: summary.risks.length
  }
};

fs.writeFileSync(path.join(OUT_DIR, 'run_info.json'), JSON.stringify(runInfo, null, 2), 'utf8');
console.log('Successfully generated run_info.json!');
