const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const OUT_DIR = path.join(__dirname, 'out_001_gemini_3_5_flash');
const schemaPath = path.join(OUT_DIR, 'schema.chrome_extension_behavior.json');
const summaryPath = path.join(OUT_DIR, 'extension_summary.json');

function main() {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(summary);

  if (valid) {
    console.log('Schema validation PASSED successfully! 100% compliant!');
    
    // Update run_info.json and scan_log.txt with validation success
    const scanLogPath = path.join(OUT_DIR, 'scan_log.txt');
    let logContent = fs.readFileSync(scanLogPath, 'utf8');
    logContent = logContent.replace('Validation status: pending', 'Validation status: PASSED');
    fs.writeFileSync(scanLogPath, logContent, 'utf8');
  } else {
    console.error('Schema validation FAILED!');
    console.error(ajv.errorsText(validate.errors));
    process.exit(1);
  }
}

main();
