const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const { DOMParser } = require('xmldom'); // For DOM manipulation of XML
const { log } = require('../commons/utils/logger');
const {SUBSCRIBERS} = require('../initializers/initializers');

// Custom error class to mimic the ConnectMessageJobFailureError in Ruby
class ConnectMessageJobFailureError extends Error {
  constructor({ status, envelope_id, program, application_id }) {
    super(`Job failed with status: ${status} for ${envelope_id}`);
    this.status = status;
    this.envelope_id = envelope_id;
    this.program = program;
    this.application_id = application_id;
  }
}

// Mock of PostToSpecificService class from Ruby
class PostToSpecificService {
  constructor({ name, subscribers }) {
    this.name = name;
    this.subscribers = subscribers;
    this.extra_headers = {};
  }

  async postPayload(xml) {
    const headers = { 'Content-Type': 'text/xml', ...this.extra_headers };
    try {
      const response = await axios.post('YOUR_SERVICE_URL', xml, { headers });
      return { success: true, status: response.status };
    } catch (error) {
      return { success: false, status: error.response?.status || 500 };
    }
  }
}

// Main class for processing the DocuSign Connect message job
class ProcessConnectMessageJob {
  constructor() {
    this.xml = null;
    this.program_identifier = null;
  }

  // Main job execution method
  async perform({ xml, program_identifier }) {
    this.xml = xml;
    this.program_identifier = program_identifier;

    // Send XML to the external service
    const responseFromService = await this.sendXmlToService();

    // If the service fails, raise a custom error
    if (!responseFromService.success) {
      const errorDetails = {
        status: responseFromService.status,
        envelope_id: await this.getEnvelopeUUID(),
        program: this.program_identifier,
        application_id: await this.getApplicationID(),
      };
      throw new ConnectMessageJobFailureError(errorDetails);
    }
  }

  // Extract application ID(s) from the XML document
  async getApplicationID() {
    const nodes = this.findNodesWithTabLabel('APP_ID');
    if (!nodes || nodes.length === 0) return null;

    const appIds = Array.from(nodes).map(node => this.getSiblingTabValue(node)).filter(Boolean);
    return [...new Set(appIds)].join(',');
  }

  // Extract the Envelope UUID from the XML
  async getEnvelopeUUID() {
    const json = await this.xmlToJson();
    return json.DocuSignEnvelopeInformation.EnvelopeStatus.EnvelopeID;
  }

  // Helper to convert the XML to JSON for easier manipulation
  async xmlToJson() {
    return await parseStringPromise(this.xml, { explicitArray: false });
  }

  // Send XML data to external service using Axios
  async sendXmlToService() {
    const proxy = this.getProxyService();
    console.log("PROXY SERVICE GOT ",proxy);
    return await proxy.postPayload(this.xml);
  }

  // Helper method to find nodes with a specific TabLabel in the XML
  findNodesWithTabLabel(label) {
    const doc = this.getXmlDocument();
    return doc.getElementsByTagName('TabLabel');
  }

  // Get the sibling TabValue of a TabLabel node
  getSiblingTabValue(node) {
    const parent = node.parentNode;
    return parent ? parent.getElementsByTagName('TabValue')[0].textContent : null;
  }

  // Parse the XML into a DOM document for easy querying
  getXmlDocument() {
    return new DOMParser().parseFromString(this.xml, 'application/xml');
  }

  // Proxy object to mimic Ruby's external service interaction
  getProxyService() {
    return new PostToSpecificService({
      name: this.program_identifier,
      subscribers: SUBSCRIBERS, // Assuming SUBSCRIBERS is defined elsewhere in the system
    });
  }
  
 target(subscribers, name) {
    if (!this._target) {
      this._target = subscribers.find(subscriber => {
        return subscriber.name === name;
      });
    }
    return this._target;
  }
}

// Logger class (Mocked based on Ruby Logger)
class Logger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  error(message, exception) {
    console.error(`[${this.serviceName}] Error:`, message, exception);
  }
}

// Mock job processing setup, you would use a queue system like Bull or Kue
function setupJobProcessing(queue) {
  queue.process(async (job) => {
    const jobInstance = new ProcessConnectMessageJob();
    try {
      await jobInstance.perform(job.data);
     log.info('Job completed successfully.');
    } catch (error) {
      const logger = new Logger("DocuSign::ConnectMessagesController");
      logger.error("Failed to process the job", error);
    }
  });
}

module.exports = {
  ProcessConnectMessageJob,
  ConnectMessageJobFailureError,
  setupJobProcessing,
  Logger
};
