import RecipientWrapper from '../models/recipient_wrapper';
import { getSigningUrlByRecipient } from '../docusignApiUtils/getSigningUrl'
import { apiError, apiResponse } from '../commons/http-helpers/api-response';
import {connectClient} from "./utils/db/db";
import {checkUserAuthorization, verifyApiToken} from "./utils/authentication";

export async function fetchUrl(req) {
  console.log("FETCH URL CALLD")
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
        body: JSON.stringify({  message: 'Forbidden' }),
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
    console.log("PATH PARAMS ",req.pathParameters)
    console.log("QUERY STRINGS ",req.queryStringParameters);
    let queryParams = req.queryStringParameters;
    let signingUrlResponse = await getSigningUrlByRecipient(req.pathParameters.recipient_id, req.queryStringParameters?.return_url ?? null , queryParams , req.pathParameters.signature_id);
    console.log(signingUrlResponse)
    if(!signingUrlResponse || signingUrlResponse?.type === "error"){
      delete signingUrlResponse.type
      return apiError(400,{
        docusign_status : signingUrlResponse.docusign_status || undefined,
        message : signingUrlResponse.message || "Bad Request"
      })
    }
    return apiResponse({ url: signingUrlResponse })
  } catch (e) {
    console.error({ exception: e });
    console.log("EDATA ",e.response.data);
    return apiError(e.status,
       e.response.message ?? 
       e.message ?? 
       e.data ?? 
       e.response.data ? 
       {docusign_status : e.response.data.errorCode , message : e.response.data.message}
       :"BAD REQUEST"
    )

  }
}
