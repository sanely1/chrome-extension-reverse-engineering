const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.chrome_extension_behavior.json');
const jsonPath = path.join(__dirname, 'out_001_gemini_3.5_flash', 'extension_summary.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Try loading Ajv from node_modules
let Ajv;
try {
  // Let's resolve it from the extension node_modules
  const ajvModulePath = path.join(__dirname, 'extension', 'node_modules', 'ajv');
  Ajv = require(ajvModulePath);
} catch (e) {
  try {
    Ajv = require('ajv');
  } catch (err) {
    console.error("AJV module not found! Trying to run via npx ajv-cli or manually checking fields.");
  }
}

if (Ajv) {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validate = ajv.compile(schema);
  const valid = validate(json);
  
  if (valid) {
    console.log("SUCCESS: extension_summary.json conforms perfectly to the target schema!");
    process.exit(0);
  } else {
    console.error("VALIDATION ERRORS FOUND:");
    console.error(JSON.stringify(validate.errors, null, 2));
    process.exit(1);
  }
} else {
  // Simple manual check for required fields as fallback
  const required = schema.required;
  const missing = [];
  for (const field of required) {
    if (json[field] === undefined) {
      missing.push(field);
    }
  }
  
  if (missing.length === 0) {
    console.log("BASIC FALLBACK VALIDATION: All top-level required fields are present.");
    process.exit(0);
  } else {
    console.error("BASIC FALLBACK VALIDATION FAILED. Missing required fields:", missing);
    process.exit(1);
  }
}
