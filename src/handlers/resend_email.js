
import { apiError, apiResponse } from '../commons/http-helpers/api-response';
import { resendEmailByRecipient } from '../docusignApiUtils/resendEmail';
import { connectClient } from "./utils/db/db";
import { checkUserAuthorization, verifyApiToken } from "./utils/authentication";

export async function resendEnvelopeEmail(req) {
    console.log("RESEND EMAIL CALLD")
    try {
        // Step 1: Authenticate the API request
        const token = req.headers['Api-Token'] || req.headers['x-renewfund-api-token'] || req.headers['x-api-token'];
        const client = await connectClient();  // Ensure client is connected and retrieve it

        // Get the identifier from verifyApiToken
        const identifier = await verifyApiToken(token, client);
        console.log(identifier)
        if (!token || !identifier) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden' }),
            };
        }
        const authorizationToken = req.headers['Authorization'];
        if (!authorizationToken) {
            return {
                statusCode: 403,
                body: JSON.stringify({ status: 'error', message: 'Authorization failed' }),
            };
        }

        // Use checkUserAuthorization function with authorizationToken and identifier
        const authResult = await checkUserAuthorization(authorizationToken, identifier);
        if (authResult.status === 'error') {
            return {
                statusCode: 403,
                body: JSON.stringify({ status: 'error', message: authResult.message }),
            };
        }
        // ApiTokenAuthenticator.authenticate(headers); // Assume this function is available
        console.log(req.pathParameters);


        if(!req.pathParameters.signature_id && !req.pathParameters.recipient_id) return apiError(400, "One of the required parameters is missing")
       
        let response = await resendEmailByRecipient(req.pathParameters.recipient_id,req.pathParameters.signature_id);
        console.log(response)
        if (!response || response.type === "error") {
            return apiError(400, {
                docusign_status : response.docusign_status || undefined , 
                message : response.message
            })
        }
        return apiResponse(response)
    } catch (error) {
        console.error({ exception: error });
        return apiError(400, 'Bad Request')

    }
}
