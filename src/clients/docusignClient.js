import { ApiClient } from 'docusign-esign';
import { log } from '../commons/utils/logger';
import { AppConfig } from '../commons/environment/appconfig';
import jwt from 'jsonwebtoken'; // Install this package if needed

async function configureApiClient() {
  try {
    console.log("INSIDE CONFIGURE API CLIENT");

    // Create an instance of ApiClient
    const apiClient = new ApiClient();

    // Set the base path (use the appropriate URL for your environment)
    apiClient.setBasePath(AppConfig.DOCUSIGN_SERVICE_HOST); // e.g., 'https://www.docusign.net/restapi'

    // OAuth2 credentials
    const integratorKey = AppConfig.DOCUSIGN_INTEGRATOR_KEY; // Integrator Key (Client ID)
    const userId = AppConfig.DOCUSIGN_ACCOUNT_ID; // User ID (GUID)
    const privateKey = process.env.DOCUSIGN_OAUTH_TOKEN; // Private key directly from the environment variable
    const oauthBasePath = 'account.docusign.com'; // DocuSign OAuth base URL
    const scopes = ['signature', 'impersonation']; // Specify required scopes

    // JWT Claims
    const jwtClaims = {
      iss: integratorKey, // Client ID (Integrator Key)
      sub: userId, // User ID (GUID)
      aud: oauthBasePath,
      scope: scopes.join(' '), // Convert scopes array to space-separated string
      exp: Math.floor(Date.now() / 1000) + (3600), // Token expiry (e.g., 1 hour)
    };

    // Create the JWT token using the private key from the environment variable
    const jwtToken = jwt.sign(jwtClaims, privateKey, { algorithm: 'RS256' });

    // Set the OAuth2 token in the DocuSign client
    const token = await apiClient.requestJWTUserToken(
      integratorKey,
      userId,
      oauthBasePath,
      jwtToken,
      scopes
    );

    apiClient.addDefaultHeader('Authorization', `Bearer ${token.body.access_token}`);
    log.info('DocuSign API Client configured successfully with JWT.');

    return apiClient;
  } catch (error) {
    console.error('Error configuring DocuSign API Client:', error);
    throw error;
  }
}

export default configureApiClient;
