const path = require('path');

const schemaRoot = path.join(__dirname, 'doc', 'raml', 'entities', 'schema', 'requests')
const Schemas = {
  REQUESTS_SCHEMA_ROOT: path.join(__dirname, 'doc', 'raml', 'entities', 'schema', 'requests'),
  RESPONSES_SCHEMA_ROOT: path.join(__dirname, 'doc', 'raml', 'entities', 'schema', 'responses'),
  DOCUSIGN_ENVELOPE: path.join(schemaRoot, 'docusign_envelope_schema.json'),
  DOCUSIGN_CONNECT: path.join(schemaRoot, 'docusign_connect.xsd'),
  DOCUSIGN_ENVELOPE_STATUS: path.join(schemaRoot, 'docusign_envelope_status_schema.json'),
  RECIPIENT_CORRECTION: path.join(schemaRoot, 'recipient_correction_schema.json'),
};

module.exports = Schemas;
