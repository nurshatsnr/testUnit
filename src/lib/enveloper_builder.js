// External functions and modules are not rewritten
const Hancock = require('hancock');  // Assuming Hancock is an external library
const Base64 = require('base64');    // Assuming Base64 decoding is handled by an external library

// Function to initialize the envelope builder
function EnvelopeBuilder(options = {}) {
  const { documents, recipients, ...opts } = options;

  // Initialize the envelope using external Hancock library
  const envelope = new Hancock.Envelope({ ...opts });  // External Hancock library

  // Build the envelope with documents
  envelope.documents = documents.map(doc => buildHancockDocument(doc));

  // Add signature requests for each recipient
  recipients.forEach(recipient => {
    envelope.addSignatureRequest({
      recipient: buildHancockRecipient(recipient),
      document: envelope.documents[0],  // Assuming first document for all recipients
      tabs: buildTabs(recipient)
    });
  });

  // Helper function to build Hancock document
  function buildHancockDocument(document) {
    // External Hancock::Document and Base64 decoding as in Ruby
    return new Hancock.Document({
      data: Base64.decode(document.data),  // External Base64 decode
      name: document.name
    });
  }

  // Helper function to build Hancock recipient
  function buildHancockRecipient(recipientParams) {
    // External Hancock::Recipient as in Ruby
    return new Hancock.Recipient(recipientParams);
  }

  // Helper function to build tabs for the recipient
  function buildTabs(recipient) {
    // External DocuSign::TabBuilder as in Ruby
    return new DocuSign.TabBuilder(recipient).tabs;  // External TabBuilder, do not implement
  }

  // Return the envelope, similar to Ruby's `attr_reader`
  return {
    envelope
  };
}

module.exports = EnvelopeBuilder;
