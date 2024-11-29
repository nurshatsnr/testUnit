// hancockRecipient.js
const docusign = require('docusign-esign');

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

  static async fetchForEnvelope(envelope_id, hancock) {
    const envelopesApi = new docusign.EnvelopesApi(hancock.apiClient);
    try {
      // Fetch the envelope
      const envelope = await envelopesApi.getEnvelope(process.env.ACCOUNT_ID, envelope_id);
      
      // Map recipients from the envelope to our structure
      return envelope.recipients.signers.map(recipient => new HancockRecipient({
        envelope_identifier: envelope_id,
        identifier: recipient.recipientId,
        client_user_id: recipient.clientUserId,
        name: recipient.name,
        email: recipient.email,
        routing_order: recipient.routingOrder,
        recipient_type: recipient.recipientType,
        id_check: recipient.idCheck,
        status: recipient.status,
      }));
    } catch (error) {
      console.error(`Error fetching recipients for envelope ${envelope_id}:`, error);
      throw error;
    }
  }
}

module.exports = HancockRecipient;
