import { AppConfig } from "../commons/environment/appconfig";
import { log } from "../commons/utils/logger";
import { PG_CLIENT, client, connectClient } from "./utils/db/db";
import { checkUserAuthorization, verifyApiToken } from "./utils/authentication";

const fs = require('fs');
const path = require('path');
const axios = require('axios');  // For making HTTP requests to the DocuSign API
const yaml = require('js-yaml'); // For reading YAML configuration files
const Ajv = require('ajv');      // For JSON schema validation
const { Client } = require('pg');
const ajv = new Ajv();

export const create_envelope = async (event) => {
    try {
        // Step 1: Parse and validate incoming request
        const envelopeParams = JSON.parse(event.body);
        // Step 2: Build the envelope
        const envelope = buildEnvelope(envelopeParams);
        // Step 3: Send the envelope to DocuSign
        const envelopeUUID = await sendEnvelope(envelope);
        // Step 4: Return the response with the envelope UUID
        return {
            statusCode: 200,
            body: JSON.stringify({ envelope_uuid: envelopeUUID }),
        };
    } catch (error) {
        // Error handling
        console.error("Error processing envelope:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message }),
        };
    }
}

function buildEnvelope(params) {
    // Load envelope configuration from YAML

    if (params.program_identifier === 'california_first' && params.document_set_name === 'financing_documents') {
        // Load envelope configuration for California First Financing Documents
        const expiration = {
            after: AppConfig.CALIFORNIA_FIRST_FINANCING_DOCUMENTS.EXPIRATION_AFTER,
            warn: AppConfig.CALIFORNIA_FIRST_FINANCING_DOCUMENTS.EXPIRATION_WARN
        };

        const reminder = {
            delay: AppConfig.CALIFORNIA_FIRST_FINANCING_DOCUMENTS.REMINDER_DELAY,
            frequency: AppConfig.CALIFORNIA_FIRST_FINANCING_DOCUMENTS.REMINDER_FREQUENCY
        };

        return {
            documents: params.documents,
            recipients: params.recipients,
            emailSubject: AppConfig.CALIFORNIA_FIRST_FINANCING_DOCUMENTS.SUBJECT,
            emailBlurb: AppConfig.CALIFORNIA_FIRST_FINANCING_DOCUMENTS.BLURB,
            expirationDateTime: expiration,
            reminder: reminder
        };
    } else if (params.program_identifier === 'california_first' && params.document_set_name === 'completion_documents') {
        return {
            documents: params.documents,
            recipients: params.recipients,
            emailSubject: AppConfig.CALIFORNIA_FIRST_COMPLETION_DOCUMENTS.SUBJECT,
            emailBlurb: AppConfig.CALIFORNIA_FIRST_COMPLETION_DOCUMENTS.BLURB,
        };
    } else if (params.program_identifier === 'renew_pace_florida' && params.document_set_name === 'financing_documents') {
        // Load envelope configuration for California First Financing Documents
        const expiration = {
            after: AppConfig.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS.EXPIRATION_AFTER,
            warn: AppConfig.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS.EXPIRATION_WARN
        };

        const reminder = {
            delay: AppConfig.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS.REMINDER_DELAY,
            frequency: AppConfig.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS.REMINDER_FREQUENCY
        };

        return {
            documents: params.documents,
            recipients: params.recipients,
            emailSubject: AppConfig.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS.SUBJECT,
            emailBlurb: AppConfig.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS.BLURB,
            expirationDateTime: expiration,
            reminder: reminder
        };
    }
    else {
        return {
            documents: params.documents,
            recipients: params.recipients,
            emailSubject: AppConfig.RENEW_PACE_FLORIDA_COMPLETION_DOCUMENTS.SUBJECT,
            emailBlurb: AppConfig.RENEW_PACE_FLORIDA_COMPLETION_DOCUMENTS.BLURB,
        };
    }
}

async function sendEnvelope(envelope) {
    const url = `${AppConfig.DOCUSIGN_SERVICE_HOST}/v2.1/accounts/${AppConfig.DOCUSIGN_ACCOUNT_ID}/envelopes`;

    const requestBody = {
        emailSubject: envelope.emailSubject,
        documents: envelope.documents.map((doc, index) => ({
            documentBase64: doc.data,
            name: doc.name,
            fileExtension: doc.extension,
            documentId: `${index + 1}`
        })),
        recipients: {
            signers: envelope.recipients.map((recipient, index) => ({
                email: recipient.email,
                name: recipient.name,
                recipientId: `${index + 1}`,
                routingOrder: `${index + 1}`
            }))
        },
        status: 'sent', // You can set to 'created' if you don't want it sent immediately
        reminder: envelope.reminder,
        expiration: envelope.expirationDateTime
    };

    const response = await axios.post(url, requestBody, {
        headers: {
            'Authorization': `Bearer ${AppConfig.DOCUSIGN_OAUTH_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data.envelopeId;  // Return the envelope UUID (ID) from DocuSign
}

export const get_envelope = async (event) => {
    log.info("GET::ENVELOPES");
    try {


        const token = event.headers['Api-Token'] || event.headers['x-renewfund-api-token'] || event.headers['x-api-token'];

        // CONNECTING CLIENT
        log.info("CONNECTING TO CLIENT WITH CONNECTION-STRING")
        let localClient
        localClient = await new Client({
            connectionString: `postgresql://${AppConfig.DB.TIRO.DB_USER}:${AppConfig.DB.TIRO.DB_PASSWORD}@${AppConfig.DB.TIRO.DB_HOST}:5432/${AppConfig.DB.TIRO.DB_DATABASE}`,

        }).connect()
            .then((res) => {
                log.info("STRING CONNECTION TO PG AVAILABLE " + JSON.stringify(res))
                localClient = res
            })
            .catch((e) => log.info("ERROR IN CONNECTION " + JSON.stringify(e)));

        if (!localClient) log.info("NO PREVIOUS PG CLIENT AVAILABLE");


        if (!localClient) {
            // Retry connection with different method
            log.info("RETRYING DB CONN WITH HOST METHOD");
            await connectClient().catch((e) => {
                log.info("PG CLIENT ERROR : " + JSON.stringify(e))
                throw new Error("PG CLIENT ERROR")
            }).then((res) => {
                log.info("PG CLIENT CONNECTED WITH " + typeof res)
                localClient = res
            })
        }


        // AUTHORIZING 
        log.info("STARTING AUTH WITH CLIENT : " + typeof localClient)
        // Get the identifier from verifyApiToken
        const identifier = await verifyApiToken(token, localClient);
        if (!token || !identifier) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden' }),
            };
        }
        const authorizationToken = event.headers['Authorization'];
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


        //  FETCHING ENVELOPE
        const envelope_uuid = event.pathParameters.envelope_uuid;

        // const query = `
        //   SELECT e.envelope_uuid, json_agg(DISTINCT r.*) AS recipients,json_agg(DISTINCT s.*) AS statuses      
        //   FROM docu_sign_envelopes e      
        //   left JOIN docu_sign_recipients r ON r.docu_sign_envelope_id = e.id      
        //   left JOIN docu_sign_statuses s ON s.tracked_id = r.id      
        //   WHERE e.envelope_uuid = $1 
        //   GROUP BY e.envelope_uuid;
        // `;

        const query = `
        SELECT e.envelope_uuid, 
       json_agg(
           DISTINCT jsonb_build_object(
               'identifier', r.identifier,
               'client_user_id', r.client_user_id,
               'name', r.name,
               'email', r.email,
               'routing_order', r.routing_order,
               'recipient_type', r.recipient_type,
               'statuses', (
                   SELECT json_agg(
                       jsonb_build_object(
                           'name', s.name,
                           'entered_at', s.entered_at
                       )
                   )
                   FROM docu_sign_statuses s
                   WHERE s.tracked_id = r.id 
                     AND s.tracked_type = 'DocuSign::Recipient' 
                     
               )
           )
       ) AS recipients,  -- Alias for recipient status
       json_agg(
           DISTINCT jsonb_build_object(
               'name', s.name,
               'entered_at', s.entered_at
           )
       ) AS statuses  -- Alias for envelope status
FROM docu_sign_envelopes e
LEFT JOIN docu_sign_recipients r ON r.docu_sign_envelope_id = e.id
LEFT JOIN docu_sign_statuses s ON s.tracked_id = e.id 
                                AND s.tracked_type = 'DocuSign::Envelope'
WHERE e.envelope_uuid = $1
GROUP BY e.envelope_uuid
        `

        if (!localClient) localClient = await connectClient();
        const res = await localClient.query(query, [envelope_uuid]);

        log.debug("PG ROWS " + JSON.stringify(res.rows))
        if (res.rows.length === 0) {
            // If no record is found, return 404
            log.info("NO ENVELOPE FOUND")
            return {
                statusCode: 404,
                // body: JSON.stringify({ error: "Envelope not found" }),
                body: 'null',
            };
        }
        // Step 5: Return the envelope details in JSON format
        log.info("ENVELOPE FETCHED " + JSON.stringify(res.rows[0]))
        let transformedResponse = transformData(res.rows[0])
        return {
            statusCode: 200,
            body: JSON.stringify({
                envelope_uuid,
                recipients: res.rows[0].recipients,
                statuses: res.rows[0].statuses
            }),
        };

    }

    catch (error) {
        log.info('Error retrieving the envelope:' + JSON.stringify(error));

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve envelope data' }),
        };
    }

    finally {


        // Step 6: Close the database connection
        log.info("FINALLY CLOSING CONNECTION ");
        // await localClient.end();

    }
}
function transformData(input) {
    // Step 1: Transform recipients array

    const recipients = input.recipients.map(recipient => ({
        identifier: recipient.client_user_id,
        client_user_id: recipient.client_user_id,
        name: recipient.name,
        email: recipient.email,
        routing_order: recipient.routing_order,
        recipient_type: recipient.recipient_type,
        statuses: input.statuses
            .filter(status => status.name === "sent")
            .map(status => ({                         // Map each 'sent' status
                name: "sent",
                entered_at: status.entered_at
            }))
    }));

    // Step 2: Prepare statuses array
    const statuses = input.statuses.map(status => ({
        name: status.name,
        entered_at: status.entered_at
    }));

    // Step 4: Return final transformed object
    return {
        envelope_uuid: input.envelope_uuid,
        recipients: recipients,
        statuses: statuses
    };
}
