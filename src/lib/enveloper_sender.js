// External functions and modules are not rewritten
const fs = require('fs');
const path = require('path');

// Function to initialize the envelope sender
function EnvelopeSender(options = {}) {
  // Extracting options
  const program_identifier = options["program_identifier"];
  const document_set_name = options["document_set_name"];
  const documents = options["documents"];
  const recipients = options["recipients"];

  // Function to send the envelope
  function send() {
    return buildEnvelope().send();  // External function call similar to Ruby's `send!`
  }

  // Fetch envelope configuration
  function envelopeConfig() {
    // External function call to `EnvelopeConfig` as in Ruby
    const configPath = path.join(__dirname, "config", "envelopes", program_identifier, `${document_set_name}.yml`);
    return new EnvelopeConfig(configPath);  // Do not implement `EnvelopeConfig`
  }

  // Function to build the envelope
  function buildEnvelope() {
    // External function call to `EnvelopeBuilder` as in Ruby
    return new EnvelopeBuilder({
      documents: documents,
      recipients: recipients,
      email: envelopeConfig().email,   // Access email from envelope config
      expiration: envelopeConfig().expiration,  // Access expiration from envelope config
      reminder: envelopeConfig().reminder,  // Access reminder from envelope config
    }).envelope;  // Do not implement `EnvelopeBuilder` or `envelope`
  }

  // Return the send function, simulating Ruby's `send!`
  return {
    send
  };
}

module.exports = EnvelopeSender;
