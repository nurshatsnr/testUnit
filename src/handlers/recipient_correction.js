// Import all external functions and modules
// const { updateRecipientInHancock } = require('./services/hancockService');

const { UpdateServiceRecipientJob } = require('../jobs/update_service_recipient_job');
const { validateRequest, SCHEMAS } = require('../validations/request_validator');
// const { buildErrorMessage } = require('./utils/errorUtils');

// Constants
const EMAIL_FOR_PLACEHOLDER_CONTRACTOR_USER = "devteam+contractor_placeholder@renewfinancial.com";

class SignerAlreadyUpdatedError extends Error {}
class RecipientNotUpdatedError extends Error {}

// RecipientCorrectionController as a class
class RecipientCorrectionController {
  constructor(params) {
    this.params = params;
    this.program = params.program_identifier;
    this.docusignRecipient = this.getDocusignRecipient(); // Implement this based on your setup
  }

  async update() {
    if (!this.validUpdateParams()) {
      throw new Error("Email and Name are required");
    }

    if (this.hasSchemaErrors()) {
      return this.renderError();
    }

    try {
      if (this.docusignRecipient?.valid) {
        await this.updateRecipient();

        const serviceResponseStatus = this.serviceResponse?.status || 200;
        const serviceResponseBody = this.serviceResponse?.body || "success";

        return this.renderJSON({ message: serviceResponseBody }, serviceResponseStatus);
      } else {
        throw new Error(`Could not retrieve all required data for: ${JSON.stringify(this.params)}`);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateRecipient() {
    if (this.placeholderRecipient() || this.updateOverride()) {
      await updateRecipientInHancock({
        recipient: this.docusignRecipient,
        newName: this.newName(),
        newEmail: this.newEmail(),
      });

      this.docusignRecipient.name = this.newName();
      this.docusignRecipient.email = this.newEmail();

      UpdateServiceRecipientJob.performLater(this.filteredSerialization(), this.program);
    } else {
      throw new SignerAlreadyUpdatedError(
        `Signer for this envelope has already been changed from ${EMAIL_FOR_PLACEHOLDER_CONTRACTOR_USER}. Please confirm that you would like to override this.`
      );
    }
  }

  handleError(error) {
    if (error instanceof SignerAlreadyUpdatedError) {
      console.log(error);
      return this.renderJSON(buildErrorMessage(error), 409); // Conflict
    } else if (error instanceof RecipientNotUpdatedError) {
      console.log(error);
      return this.renderJSON(buildErrorMessage(error), 500); // Internal Server Error
    } else {
      console.log(error);
      return this.renderJSON(buildErrorMessage(error), 400); // Bad Request
    }
  }

  // Utility and helper methods
  newName() {
    return this.params.name;
  }

  newEmail() {
    return this.params.email;
  }

  validUpdateParams() {
    return this.newEmail() && this.newName();
  }

  updateOverride() {
    return this.params.override === 'true';
  }

  hasSchemaErrors() {
    return this.schemaErrors()?.length > 0;
  }

  placeholderRecipient() {
    return this.docusignRecipient.email === EMAIL_FOR_PLACEHOLDER_CONTRACTOR_USER;
  }

  schemaErrors() {
    return validateRequest(SCHEMAS.RECIPIENT_CORRECTION, this.params);
  }

  filteredSerialization() {
    // Implement this based on your model
    return this.docusignRecipient.filteredSerialization();
  }

  renderError() {
    console.log(this.schemaErrors());
    return this.renderJSON(buildErrorMessage(this.schemaErrors().join("; ")), 400);
  }

  renderJSON(message, status) {
    return {
      statusCode: status,
      body: JSON.stringify({ message })
    };
  }

  getDocusignRecipient() {
    // Implement this based on your setup to fetch recipient data
  }
}

module.exports = RecipientCorrectionController;
