// const { BuildRecords } = require('./buildRecords'); // Assuming the path to the file
// const { RequestValidator } = require('./requestValidator'); // Assuming the path to the file
// const Schemas = require('./schemas'); // Assuming the path to the file
import XMLBuilder from 'xmlbuilder';
import { ProcessConnectMessageJob } from '../../jobs/process_connect_message_job';
import BuildRecords from '../../lib/build_records';
import { DOCUSIGN_CONNECT } from '../../validations/schemas';
import RequestValidator from '../../validations/request_validator';
import { apiError, apiResponse } from '../../commons/http-helpers/api-response';
import { checkUserAuthorization, verifyApiToken } from "../utils/authentication";
import { connectClient } from "../utils/db/db";


function validator() {
  return new RequestValidator();
}

async function messageRecord(req) {
  return await BuildRecords({ connectMessageXml: req.body }).build();
}

export async function processXml(req) {
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


    if (!req.body) return apiError(400)

    const messageRecordObj = await messageRecord(req);
    // console.log("MESSAGE RECORD ",messageRecordObj);
    await messageRecordObj.save(); // Save the message record

    // Send acknowledgment and enqueue job for processing
    let response = docusignConnectAcknowledgement(messageRecordObj.toJSON())
    new ProcessConnectMessageJob().perform({ xml: req.body, programIdentifier: (messageRecordObj.toJSON()).programIdentifier });
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Max-Age': '3600',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,HEAD,OPTIONS',
        'Content-Type': 'application/text'
      },
      body: response
    };

  } catch (error) {
    if (error) {

      console.error({ exception: error });
      return apiError(400, JSON.stringify({ error: error.message }));

    } else {

      console.error({ exception: error });
      return apiError(500, JSON.stringify({ error: error.message }));

    }
  }
}


function docusignConnectAcknowledgement(messageRecord) {
  const envelopeUuid = messageRecord.envelope_uuid.toString();

  const xmlBuilder = XMLBuilder.create('soap:Envelope', { version: '1.0', encoding: 'UTF-8' })
    .att('xmlns:soap', 'http://schemas.xmlsoap.org/soap/envelope/')
    .ele('soap:Body')
    .ele('soap:response')
    .ele('EnvelopeID', envelopeUuid)
    .up()  // Go back to 'soap:response'
    .up()    // Go back to 'soap:Body'
    .up();     // Go back to 'soap:Envelope'

  return xmlBuilder.end({ pretty: true });
}

export const ConnectMessagesController = processXml;
