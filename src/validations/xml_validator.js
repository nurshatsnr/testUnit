const { parseStringPromise } = require('xml2js');
const { DOMParser } = require('xmldom');

class XmlValidator {
  async validate(schema, xml) {
    if (!this.isKnown(schema)) return this.unknownSchemaError(schema); // Corresponds to unknown_schema_error(schema)

    try {
      const parsedXml = await this.parse(xml); // Corresponds to parse xml
      return this.errorsOrNil(); // Corresponds to errors_or_nil
    } catch (error) {
      return ["Could not validate xml"]; // Corresponds to rescue block
    }
  }

  // Private methods

  async parse(xml) {
    // Parse XML using DOMParser
    const parsed = new DOMParser().parseFromString(xml, 'text/xml');
    return this.validateParsedXml(parsed); // Corresponds to validate_parsed_xml
  }

  validateParsedXml(parsed) {
    this.ensureNode("DocuSignEnvelopeInformation", parsed); // Corresponds to ensure_node
    this.ensureNode("EnvelopeStatus", parsed);
    this.ensureNode("EnvelopeID", parsed);
    this.ensureNode("Status", parsed);
  }

  ensureNode(node, parsed) {
    // XPath query using XML namespace; adjust according to your XML structure
    const nodes = parsed.getElementsByTagName(node);
    if (nodes.length === 0) {
      this.errors.push(node + " is missing"); // Corresponds to errors
    }
  }

  errors() {
    if (!this._errors) this._errors = []; // Corresponds to errors
    return this._errors;
  }

  errorsOrNil() {
    return this.errors().length === 0 ? null : this.errors(); // Corresponds to errors_or_nil
  }

  isKnown(schemaPath) {
    return schemaPath === Schemas.DOCUSIGN_CONNECT; // Corresponds to is_known?
  }

  unknownSchemaError(schemaPath) {
    return [`${schemaPath.toString()} is an unknown schema`]; // Corresponds to unknown_schema_error
  }
}

module.exports = XmlValidator;
