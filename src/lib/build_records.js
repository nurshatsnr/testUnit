// Import necessary modules
const xml2js = require('xml2js'); // To parse XML
const _ = require('lodash'); // For utility functions like flatten and find
const moment = require('moment-timezone'); // To handle time and timezone
const ConnectMessage = require('../models/docu_sign/connect_message');
const Status = require('../models/docu_sign/status');
const Recipient = require('../models/docu_sign/recipient');
const Envelope = require('../models/docu_sign/envelope');

// Constants equivalent to the Ruby arrays
const RECIPIENT_STATUSES = [
  "Created", "Sent", "Delivered", "Signed", "Declined", "Completed", "FaxPending", "AutoResponded"
];

const ENVELOPE_STATUSES = [
  "Created", "Deleted", "Sent", "Delivered", "Signed", "Completed", "Declined", "Voided"
];

// The main BuildRecords function
function BuildRecords({ connectMessageXml }) {
  let statusRecordsCreated = [];
  let connectMessage = null;
  let recipientsRecords = null;
  let envelopeUuid = null;
  let envelopeStatusHash = null;
  let timezoneOffset = null;
  let envelopeInformation = null;
  let xmlHash = null;

  // Main build function (equivalent to build method in Ruby)
  async function build() {
    await buildEnvelopeStatuses();
    await buildRecipients();
    return buildConnectMessage();
  }

  // Build connect message (external ConnectMessage model, assuming it's available)
  async function buildConnectMessage() {
    console.log("TO SAVE ", {
      // envelope: await envelope(),
      // xml_payload: connectMessageXml,
      // generated_at: adjustToUTC(envelopeStatusHash["TimeGenerated"]),
      envelope_uuid: envelopeUuid,
      program_identifier: programIdentifier(),
      most_recent_status_entered_at: mostRecentStatusEnteredAt(),
      // created_at: new Date(),
      // updated_at: new Date()
    })
    return new ConnectMessage({
      envelope: await envelope(),
      xml_payload: connectMessageXml,
      generated_at: adjustToUTC(envelopeStatusHash["TimeGenerated"]),
      envelope_uuid: envelopeUuid,
      program_identifier: programIdentifier(),
      most_recent_status_entered_at: mostRecentStatusEnteredAt(),
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Build recipients and add them to the envelope (external Recipient model)
  async function buildRecipients() {
    if (!recipientsRecords) {
      const recipients = _.flatten([_.get(envelopeStatusHash, "RecipientStatuses.RecipientStatus", [])]);

      recipientsRecords = recipients.map(async recipient => await buildRecipient(recipient));

      const envy = await envelope();
      // console.log("ENVELOPE AT BUILDENEVELOPESTATUSES ", envy);
      // Add to envelope recipients (assuming envelope has a recipients array)
      // envelope().recipients.push(...recipientsRecords);
    }
  }

  // Build each recipient (external Recipient model)
  async function buildRecipient(recipientHash) {
    const recipientRecord = await Recipient.findOrCreate({ identifier: recipientHash["RecipientId"] });

    recipientRecord.assignAttributes({
      recipient_type: _.get(recipientHash, "Type", "").toLowerCase(),
      name: recipientHash["UserName"],
      email: recipientHash["Email"],
      routing_order: recipientHash["RoutingOrder"],
      client_user_id: recipientHash["ClientUserId"]
    });

    for (const statusName of RECIPIENT_STATUSES) {
      let statusRecord = await buildStatusRecord(recipientHash, statusName);
      // console.log("STATUS RECORD IN BUILDRECIPIENT ", statusRecord);

      if (statusRecord) {
        recipientRecord.statuses.push(statusRecord);
      }
    }

    return recipientRecord;
  }

  async function buildStatusRecord(dataHash, statusName) {
    // console.log(`Building status record for ${statusName} with dataHash: ${dataHash}`);
    // console.log("DATA HASH PASSED ",dataHash);
    const enteredAt = dataHash[0]?.[statusName]?.[0] ?? null;
    // console.log("ENTERED AT ",enteredAt);
    if (enteredAt) {

      const adjustedEnteredAt = adjustToUTC(enteredAt);
      const [statusRecord, created] = await Status.findOrCreate({
        where: { name: statusName.toLowerCase() }, // Specify the condition to find
        defaults: {
          name: statusName.toLowerCase(),
          entered_at: adjustedEnteredAt,
          created_at: new Date(),
          updated_at: new Date()
        }, // Specify the default values to set if creating,
      });

      // console.log("STATUS RECORD IN BUILDSTATUSRECORD ",statusRecord.get());
      statusRecordsCreated.concat(statusRecord.get());
      return statusRecord;

    } else {
      console.error(`No enteredAt value for status: ${statusName}`);
    }

    return null;

  }


  // Build envelope statuses and add them to envelope (external Envelope and Status models)
  async function buildEnvelopeStatuses() {
    for (const statusName of ENVELOPE_STATUSES) {
      // console.log("STATUS NAME: ", statusName);

      let hash = await getEnvelopeStatusHash();
      // console.log("ENVELOPE STATUS HASH: ", hash);

      const statusRecord = await buildStatusRecord(hash, statusName);
      // console.log("BUILD STATUS RECORD ", statusRecord);

      if (statusRecord) {
        const envy = await envelope();
        // console.log("ENVELOPE AT BUILDENEVELOPESTATUSES ", envy);

        // Push the statusRecord into the statuses of the envelope
        // envy.dataValues.statuses.push(statusRecord); // Note: No need to await here
      }
    }
  }


  // Adjust time to UTC
  function adjustToUTC(time) {
    return moment.tz(time, "UTC").subtract(timezoneOffset, 'hours').toDate();
  }

  // Return the envelope (external Envelope model)
  async function envelope() {
    // console.log("ENVELOPE STATUS HASH AT ENVELOPE() ", envelopeStatusHash);
    if (!envelopeUuid) envelopeUuid = envelopeStatusHash[0]?.["EnvelopeID"]?.[0] ?? null;
    // console.log("ENEVELOPE ID ", envelopeUuid)
    let [envelopFoundOrCreated, created] = await Envelope.findOrCreate({
      where: { envelope_uuid: envelopeUuid },
      defaults: {
        envelope_uuid: envelopeUuid,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    return envelopFoundOrCreated.get()
  }

  // Get program identifier from custom fields
  function programIdentifier() {
    const customFields = _.flatten([envelopeStatusHash[0]?.["CustomFields"][0]?.["CustomField"] || []]);
    const field = _.find(customFields, cf => cf["Name"] === "program_identifier");
    return field ? field["Value"] : "california_first";
  }

  // Get the most recent status entered at time
  function mostRecentStatusEnteredAt() {
    if (!statusRecordsCreated || statusRecordsCreated.length === 0) {
      console.warn('No status records were created');
      return null; // Handle this case appropriately in your code
    }

    // Return the maximum entered_at time
    console.log("STATUS RECORD CREATED @mostRecent ", statusRecordsCreated);
    const mostRecent = _.maxBy(statusRecordsCreated, "entered_at");
    return mostRecent ? mostRecent.entered_at : null;
  }


  // Convert XML to JSON (xml2js used for parsing)
  function parseXmlToJson() {
    let result;
    xml2js.parseString(connectMessageXml, (err, res) => {
      if (err) throw err;
      result = res;
    });
    return result;
  }

  // Retrieve envelope status hash
  async function getEnvelopeStatusHash() {
    // console.log("GETTING ENVELOPE STATUS HASH ",envelopeStatusHash);
    if (!envelopeStatusHash) {
      let envelopeInfo = await getEnvelopeInformation();
      // console.log("ENVELOPE INFO RECEIVED IN Status HASH ",envelopeInfo);
      envelopeStatusHash = envelopeInfo["EnvelopeStatus"];
    }
    // console.log("GOT ENVELOPE STATUS HASH ",envelopeStatusHash);
    return envelopeStatusHash;
  }

  // Get envelope information from parsed XML
  async function getEnvelopeInformation() {
    // console.log("GETTING ENVELOPE INFORMATION ",envelopeInformation);

    if (!envelopeInformation) {
      let convertedXmlHash = await xmlToHash()
      // console.log("XML HASH ",convertedXmlHash);
      envelopeInformation = _.get(convertedXmlHash, "DocuSignEnvelopeInformation");
      // console.log("GOT ENVELOPE INFORMATION ",envelopeInformation);
    }
    return envelopeInformation;
  }

  async function xmlToHash() {
    if (!xmlHash) {
      const parser = new xml2js.Parser();
      // console.log("CONNECTMSGXML ",connectMessageXml)
      xmlHash = await parser.parseStringPromise(connectMessageXml);
      // console.log("XML TO HASH ", xmlHash)
    }
    return xmlHash;
  }

  // Get timezone offset from parsed XML
  function getTimezoneOffset() {
    if (!timezoneOffset) timezoneOffset = getEnvelopeInformation()["TimeZoneOffset"];
    return timezoneOffset;
  }

  // Return the main build function
  return {
    build
  };
}

module.exports = BuildRecords;
