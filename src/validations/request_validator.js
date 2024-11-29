const JsonValidator = require('./json_validator'); // Assuming you have a JsonValidator class
const XmlValidator = require('./xml_validator');   // Assuming you have an XmlValidator class

class RequestValidator {
  validate(schemaPath, stringToValidate) {
    const validator = schemaPath.endsWith('xsd') ? this.xmlValidator() : this.jsonValidator();
    return validator.validate(schemaPath, stringToValidate); // Corresponds to validator.validate(schema_path, string_to_validate)
  }

  // Private methods

  jsonValidator() {
    if (!this._jsonValidator) {
      this._jsonValidator = new JsonValidator(); // Corresponds to @json_validator
    }
    return this._jsonValidator;
  }

  xmlValidator() {
    if (!this._xmlValidator) {
      this._xmlValidator = new XmlValidator(); // Corresponds to @xml_validator
    }
    return this._xmlValidator;
  }
}

module.exports = RequestValidator;
