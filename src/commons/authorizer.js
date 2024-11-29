import { log } from "./utils/logger";

function createAuthorizedResponse(resource) {
  return {
    principalId: 'me',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: resource
      }]
    }
  };
}

export async function handler(event, context) {
  // For debug purposes only.
  // You should not log any sensitive information in production.
  log.info("EVENT to handle: \n" + JSON.stringify(event, null, 2));

  const { headers, methodArn } = event;

  // This is for demo purposes only.
  // This check is probably not valuable in production.
  if(headers['X-Forwarded-Proto'] === 'https') {
    return createAuthorizedResponse(methodArn);
  } else {
    throw new Error('Unauthorized');
  }
}
