import axios from 'axios';
import { AppConfig } from '../commons/environment/appconfig'; // Ensure correct configuration
import { log } from '../commons/utils/logger';

export async function getSigningUrlByRecipient(recipientId, returnUrl, queryParams, passedEnvelope) {
  try {
    // Define the base API URL
    const baseUrl = AppConfig.DOCUSIGN_SERVICE_HOST; // e.g., 'https://account.docusign.com'
    const accountId = AppConfig.DOCUSIGN_ACCOUNT_ID; // Your account ID

    // Axios headers for Authorization
    const headers = {
      'Authorization': `Bearer ${AppConfig.DOCUSIGN_OAUTH_TOKEN}`, // OAuth token
      'Content-Type': 'application/json',
    };

    // Step 1: Fetch recipient details directly using passedEnvelope
    const recipientsUrl = `${baseUrl}/v2/accounts/${accountId}/envelopes/${passedEnvelope}/recipients`;
    log.info("Fetching recipient details from URL: ", recipientsUrl);

    const recipientDetailsResponse = await axios.get(recipientsUrl, { headers });

    const recipients = recipientDetailsResponse.data.signers;

    // Step 2: Find the recipient by recipientId
    const recipient = recipients.find((rec) => rec.recipientId === recipientId);

    if (!recipient) {
      log.info(`No recipient found for recipientId: ${recipientId}`);
      return {
        type : "error",
        
          message: "The request contained at least one invalid parameter. Invalid value specified for envelopeId.",
          docusign_status: "INVALID_REQUEST_PARAMETER"
        
      }
    }

    log.info("Found recipient: ", recipient);

    // Step 3: Generate the signing URL
    const signingUrlEndpoint = `${baseUrl}/v2/accounts/${accountId}/envelopes/${passedEnvelope}/views/recipient`;
    log.info("SIGNING URL ENDPOINT: ", signingUrlEndpoint);

    const viewRequest = {
      clientUserId: recipientId, // The client user ID (unique identifier for the recipient)
      authenticationMethod: 'none', // Authentication method
      userName: recipient.name, // Recipient's name
      email: recipient.email, // Recipient's email
      returnUrl:
        returnUrl ??
        (queryParams?.program_identifier && queryParams?.app_id
          ? `${AppConfig.DOCUSIGN_RETURN_ENDPOINT}/${queryParams.program_identifier}/applications/${queryParams.app_id}`
          : `${AppConfig.DOCUSIGN_RETURN_ENDPOINT}/applications`),
      // Redirect URL after signing
    };

    // Step 4: Make the request to get the signing URL
    const signingUrlResponse = await axios.post(signingUrlEndpoint, viewRequest, { headers });
    log.info('Signing URL response: ', signingUrlResponse);
    log.info('Signing URL: ', signingUrlResponse.data.url);

    return signingUrlResponse.data.url;
  } catch (error) {
    log.error('Error fetching signing URL:', error);
    throw error;
  }
}

export default getSigningUrlByRecipient;
