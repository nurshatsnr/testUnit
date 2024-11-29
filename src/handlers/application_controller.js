import { log } from '../commons/utils/logger';

const RecipientWrapper = require('../models/recipient_wrapper');

const ApiTokenAuthenticator = require('./your-auth-and-recipients-modules').ApiTokenAuthenticator;


let response = {};

function authenticate(headers) {
  try {
    ApiTokenAuthenticator.authenticate(headers);
  } catch (error) {
    handleError(error);
  }
}

function buildErrorMessage(error) {
  return {
    message: error.message || error,
    docusign_status: error.docusign_status || undefined,
  };
}

function recipientSigningUrl(recipient, returnUrl) {
  return recipient.hancock_recipient.signing_url(returnUrl || defaultReturnUrl());
}

function envelopeRecipients(signatureId) {
  return RecipientWrapper.pullRecipientsFromEnvelope(signatureId);
}

export function docusignRecipient(recipientId, signatureId) {
  const recipients = envelopeRecipients(signatureId);
  return recipients.find((recipient) => recipient.identifier === recipientId);
}

function filteredSerialization(recipientId, signatureId) {
  const recipient = docusignRecipient(recipientId, signatureId);
  return Object.fromEntries(
    Object.entries(recipient).filter(([key]) => RecipientWrapper.ATTRS.includes(key))
  );
}

function render200() {
  response.status = 200;
  response.json = jsonMessage("Success");
}

function render204() {
  response.status = 204;
  response.body = null; // No content
}

function render400(exception) {
  const message = exception ? buildErrorMessage(exception) : jsonMessage("Bad Request");
  response.status = 400;
  response.json = message;
}

function render401() {
  response.status = 401;
  response.json = jsonMessage("Not Authorized");
}

function render403() {
  response.status = 403;
  response.json = jsonMessage("Forbidden");
}

function render404(exception) {
  const message = exception ? buildErrorMessage(exception) : jsonMessage("Not Found");
  response.status = 404;
  response.json = message;
}

function render500() {
  response.status = 500;
  response.json = jsonMessage("Internal server error");
}

function defaultReturnUrl(programIdentifier, appId) {
  return `${process.env.DOCUSIGN_CONFIG['return_endpoint']}/${programIdentifier}/applications/${appId}`;
}

function jsonMessage(msg) {
  return { message: msg };
}

function handleError(error) {
  if (error instanceof ApiTokenAuthenticator.ApiTokenMismatch) {
    render401();
  } else if (error instanceof ApiTokenAuthenticator.MissingApiToken) {
    render403();
  } else {
    render404(error);
  }
}

// Simulated API call
function callApi(headers, signatureId, recipientId, returnUrl, programIdentifier, appId) {
  authenticate(headers);

  // Example API interaction logic can go here
  try {
    // Invoke recipient logic if needed
    render200(); // or other render methods based on logic
  } catch (error) {
    handleError(error);
  }

  // Example output
  return response;
}

// Example usage
const headers = { /* headers for authentication */ };
const responseOutput = callApi(headers, 'signatureId', 'recipientId', 'returnUrl', 'programIdentifier', 'appId');

log.info(responseOutput);
