import RecipientWrapper from '../models/recipient_wrapper';
import { updateRecipientDetails } from '../docusignApiUtils/updateRecipient'
import { apiError, apiResponse } from '../commons/http-helpers/api-response';
import { connectClient } from "./utils/db/db";
import { checkUserAuthorization, verifyApiToken } from "./utils/authentication";
import { log } from '../commons/utils/logger';

export async function recipientUpdate(req) {
    console.log("RECIPIENT UPDATE CALLD")
    try {
        // Step 1: Authenticate the API request
        const token = req.headers['Api-Token'] || req.headers['x-renewfund-api-token'] || req.headers['x-api-token'];
        const client = await connectClient();  // Ensure client is connected and retrieve it

        // Get the identifier from verifyApiToken
        const identifier = await verifyApiToken(token, client);
        log.debug("Identifier " + identifier)
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

        log.debug(JSON.stringify(req.pathParameters));
        let body = JSON.parse(req.body);
        log.debug("BODY " + JSON.stringify(body));

        // check if email and name present
        if (!body.email || !body.name) return apiError(400, {
            message : "Email and Name are required"
        });
        // check the format of email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        let emailTest = emailRegex.test(body.email);
        if (!emailTest) return apiError(400, 'Incorrect email format')
        // // check for name
        // if (!body.name) return apiError(400, 'Name is required')

        // check for override
        if (body.override === null || undefined) return apiError(400, 'Override is required')
        // check for override false
        const EMAIL_FOR_PLACEHOLDER_CONTRACTOR_USER = "devteam+contractor_placeholder@renewfinancial.com"
        if (body.override === false) return apiError(409, {
            message : `Signer for this envelope has already been changed from ${EMAIL_FOR_PLACEHOLDER_CONTRACTOR_USER}. Please confirm that you would like to override this.`
        })

        let response = await updateRecipientDetails(req.pathParameters.recipient_id, req.pathParameters.signature_id, body.contractor_user_identifier, body.program_identifier, { name: body.name, email: body.email });
        log.debug(JSON.stringify(response))
        if (response?.type && response.type === "error") {
            return apiError(400, response.message)
        }
        if (response) response = { message: "Success" }
        return apiResponse(response)
    } catch (error) {
        log.error({ exception: error });
        return apiError(500, error?.message || 'Internal Server Error')

    }
}
