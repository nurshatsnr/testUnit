const { Validator } = require('jsonschema'); // Assuming you're using the 'jsonschema' package

class JsonValidator {
  validate(schemaPath, jsonToValidate) {
    const validator = new Validator(); // Initialize the JSON Schema Validator

    // Check if the JSON is valid according to the schema
    const isValid = validator.validate(jsonToValidate, require(schemaPath)).valid; // Load the schema and validate

    if (!isValid) {
      return validator.validate(jsonToValidate, require(schemaPath)).errors; // Return validation errors if not valid
    }

    return null; // Return null if valid
  }
}

module.exports = JsonValidator;
