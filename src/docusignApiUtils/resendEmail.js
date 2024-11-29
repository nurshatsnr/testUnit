import axios from 'axios';
import { AppConfig } from '../commons/environment/appconfig'; // Ensure correct configuration
import { log } from '../commons/utils/logger';

export async function resendEmailByRecipient(recipientId, passedEnvelope) {
  try {
    const baseUrl = AppConfig.DOCUSIGN_SERVICE_HOST; // e.g., 'https://demo.docusign.net'
    const accountId = AppConfig.DOCUSIGN_ACCOUNT_ID; // Your account ID

    // Axios headers for Authorization
    const headers = {
      'Authorization': `Bearer ${AppConfig.DOCUSIGN_OAUTH_TOKEN}`, // OAuth token
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-DocuSign-TimeTrack': 'DS-REQUEST-TIME',
    };

    // Step 1: Fetch recipient details directly for the passed envelope ID
    const recipientsUrl = `${baseUrl}/v2/accounts/${accountId}/envelopes/${passedEnvelope}/recipients`;



    const recipientDetailsResponse = await axios.get(recipientsUrl, { headers });

    const recipients = recipientDetailsResponse.data.signers;


    console.log("FETCHED RECIPIENT ",recipientDetailsResponse.data);

    // Find the recipient in the list of signers
    const foundRecipient = recipients.find(recipient => recipient.recipientId === recipientId);

    if (!foundRecipient) {
      log.info('No recipient found for recipientId:', recipientId);
      return {
        type: "error",
        message: "No recipient found for recipientId",
      };
    }

    // Step 2: Resend the email using the provided envelope ID and found recipient details
    const resendUrl = `${baseUrl}/v2/accounts/${accountId}/envelopes/${passedEnvelope}/recipients?resend_envelope=true`;
    const resendRequestBody = {
      signers: [
        {
          recipientId: recipientId,
          name: foundRecipient.name,
        },
      ],
    };

    const resendResponse = await axios.put(resendUrl, resendRequestBody, { headers });
    log.info('Resend email response:', resendResponse.data);
    return resendResponse.data && { message: "Success" };

  } catch (error) {
    console.error('Error resending email:', error.response.data);
    return {
      type: "error",
      docusign_status: error?.response?.data?.errorCode || undefined,
      message: error?.response?.data?.message || error?.response?.message || error
    }
  }
}

export default resendEmailByRecipient;
