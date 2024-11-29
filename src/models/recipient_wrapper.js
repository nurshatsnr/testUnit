// Import the required external functions or modules

const { Hancock } = require('../jobs/hancock');
const { fetchForEnvelope, HancockRecipient } = require('./hancockRecipient');
const { default: configureApiClient } = require('../clients/docusignClient');

class RecipientWrapper {
  // Define the validated and unvalidated attributes
  static VALIDATED_ATTRS = [
    'envelope_identifier',
    'identifier',
    'name',
    'email',
    'routing_order',
    'recipient_type'
  ];

  static UNVALIDATED_ATTRS = [
    'id_check',
    'client_user_id',
    'status'
  ];

  static ATTRS = [...RecipientWrapper.VALIDATED_ATTRS, ...RecipientWrapper.UNVALIDATED_ATTRS];

  constructor(attributes = {}) {
    // Initialize all attributes with the provided data or set to null if undefined
    RecipientWrapper.ATTRS.forEach(attr => {
      this[attr] = attributes[attr] || null;
    });

    // Ensure that validated attributes are present
    this.validatePresenceOf(RecipientWrapper.VALIDATED_ATTRS);
  }

  // Validate presence of required attributes
  validatePresenceOf(attrs) {
    attrs.forEach(attr => {
      if (!this[attr]) {
        throw new Error(`Missing required attribute: ${attr}`);
      }
    });
  }

  // Static method to pull recipients from an envelope
  static async pullRecipientsFromEnvelope(envelopeId) {
    const rawRecipients = await fetchForEnvelope(envelopeId,new Hancock(configureApiClient()));
    return rawRecipients.map(rawRecipient => new RecipientWrapper(RecipientWrapper.mapRawDocuSignData(rawRecipient)));
  }

  // Static method to map raw recipient data into a RecipientWrapper format
  static mapRawDocuSignData(rawRecipient) {
    return {
      envelope_identifier: rawRecipient.envelope_identifier,
      identifier:          rawRecipient.identifier,
      client_user_id:      rawRecipient.client_user_id,
      name:                rawRecipient.name,
      email:               rawRecipient.email,
      routing_order:       rawRecipient.routing_order,
      recipient_type:      rawRecipient.recipient_type ? rawRecipient.recipient_type.toLowerCase() : null,
      id_check:            rawRecipient.id_check,
      status:              rawRecipient.status
    };
  }

  // Serialize object attributes for output
  attributes() {
    const attrs = {};
    RecipientWrapper.ATTRS.forEach(attr => {
      attrs[attr] = this[attr];
    });
    return attrs;
  }

  // Return a new HancockRecipient instance based on the current data
  getHancockRecipient() {
    return new HancockRecipient({
      envelope_identifier: this.envelope_identifier,
      identifier:          this.identifier,
      client_user_id:      this.client_user_id,
      name:                this.name,
      email:               this.email,
      routing_order:       this.routing_order,
      recipient_type:      this.recipient_type,
      id_check:            this.id_check,
      status:              this.status
    });
  }
}

module.exports = RecipientWrapper;
