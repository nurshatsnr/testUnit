import axios from 'axios';
import { AppConfig } from '../commons/environment/appconfig';
import { log } from '../commons/utils/logger';

export async function updateRecipientDetails(recipientId, signatureId, contractorUserId, programId, updatedFields) {
  try {
    const baseUrl = AppConfig.DOCUSIGN_SERVICE_HOST; // e.g., 'https://demo.docusign.net/restapi'
    const accountId = AppConfig.DOCUSIGN_ACCOUNT_ID; // Your account ID

    const headers = {
      'Authorization': `Bearer ${AppConfig.DOCUSIGN_OAUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };

    // Step 1: Retrieve all envelopes within a specified date range
    const searchEnvelopesEndpoint = `${baseUrl}/v2.1/accounts/${accountId}/envelopes`;

    log.info("SEARCH ENVELOPES ENDPOINT ",searchEnvelopesEndpoint.data);
    const queryParams = {
      from_date: '2023-01-01', // Optional: filter by date
      status: 'sent' // Optional: filter by active/sent envelopes
    };

    const searchResponse = await axios.get(searchEnvelopesEndpoint, { headers, params: queryParams });
    log.info("ENVELOPE RESPONSE ", searchResponse.data)
    const envelopes = searchResponse.data.envelopes;

    // Step 2: Iterate through the envelopes to find the one with the matching recipientId and signatureId
    let targetEnvelopeId = null;
    for (const envelope of envelopes) {
      const envelopeId = envelope.envelopeId;
      const recipientsEndpoint = `${baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/recipients`;



      // Get recipients for this envelope
      const recipientResponse = await axios.get(recipientsEndpoint, { headers });
  
      const signers = recipientResponse.data.signers;

      // Check if one of the signers matches the recipientId, signatureId, and optionally the contractor_user_identifier
      const targetSigner = signers.find(signer =>
        signer.recipientId === recipientId
        //  &&
        // signer.customFields && signer.customFields.contractor_user_identifier === contractorUserId // Assuming it's stored as a custom field
      );

      if (targetSigner) {
        targetEnvelopeId = envelopeId;
        break; // Found the correct envelope, stop searching
      }
    }

    if (!targetEnvelopeId) {
      return {
        type : "error",
        message : "No matching recipient found in any envelopes."
      }
    }

    // Step 3: Update the recipient in the found envelope
    const updateRecipientEndpoint = `${baseUrl}/v2.1/accounts/${accountId}/envelopes/${targetEnvelopeId}/recipients`;

    const recipientUpdateBody = {
      signers: [{
        recipientId, // The recipient ID you want to update
        // clientUserId: signatureId, // The signature ID
        // customFields: {
        //   contractor_user_identifier: contractorUserId, // Optional custom field
        //   program_identifier: programId // Optional custom field
        // },
        ...updatedFields, // Spread the updated fields (name, email)
      }]
    };

    log.debug("Update payload "+JSON.stringify(recipientUpdateBody));

    const updateResponse = await axios.put(updateRecipientEndpoint, recipientUpdateBody, { headers });

    log.info('Recipient updated successfully:', updateResponse.data);
    return updateResponse.data;
  } catch (error) {
    console.error('Error updating recipient:', error);
    throw error;
  }
}
