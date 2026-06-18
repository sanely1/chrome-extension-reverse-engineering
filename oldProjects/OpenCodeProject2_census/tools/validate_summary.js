const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv({ allErrors: true });

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schema.chrome_extension_behavior.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../out_001_gemini-3.5-flash/extension_summary.json'), 'utf8'));

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) {
  console.error('Validation failed:');
  console.error(validate.errors);
  process.exit(1);
} else {
  console.log('Validation successful! extension_summary.json is fully schema-compliant.');
}
