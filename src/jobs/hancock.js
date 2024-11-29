
const docusign = require('docusign-esign'); // Ensure you have this installed

class Hancock {
  constructor(apiClient) {
    this.apiClient = apiClient; // API client should be initialized with authentication
  }

  async checkEnvelopeLock(envelopeIdentifier) {
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
    try {
      const envelope = await envelopesApi.getEnvelope(process.env.ACCOUNT_ID, envelopeIdentifier);
      return envelope.locked; // Check if the envelope is locked
    } catch (error) {
      throw new Error(`Failed to check envelope lock: ${error.message}`);
    }
  }

  async resendRecipientEmail(envelopeIdentifier, recipientIdentifier) {
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
    try {
      await envelopesApi.resendEnvelope(process.env.ACCOUNT_ID, envelopeIdentifier);
      console.log(`Email resent to recipient ${recipientIdentifier}`);
    } catch (error) {
      throw new Hancock.Recipient.ResendEmailError(`Failed to resend email: ${error.message}`);
    }
  }
}

// Error class for envelope locking
class EnvelopeLockedError extends Error {
  constructor({ recipient_hash, locked_by, exception }) {
    super(`Envelope is locked: ${locked_by}`);
    this.recipientHash = recipient_hash;
    this.lockedBy = locked_by;
    this.exception = exception;
  }
}

// Define the HancockRecipient class
class HancockRecipient {
  constructor(attrs) {
    this.envelope_identifier = attrs.envelope_identifier;
    this.identifier = attrs.identifier;
    this.client_user_id = attrs.client_user_id;
    this.name = attrs.name;
    this.email = attrs.email;
    this.routing_order = attrs.routing_order;
    this.recipient_type = attrs.recipient_type;
    this.id_check = attrs.id_check;
    this.status = attrs.status;
  }

  async resendEmail(hancock) {
    // Use the hancock instance to resend the email for this recipient
    await hancock.resendRecipientEmail(this.envelope_identifier, this.identifier);
  }
}

// Extend Hancock to include Recipient errors
Hancock.Recipient = {
  ResendEmailError: class extends Error {
    constructor(message) {
      super(message);
      this.name = 'ResendEmailError';
    }
  },
};

module.exports = { Hancock, EnvelopeLockedError };
