const Queue = require('bull');
const axios = require('axios'); // Axios for HTTP requests
// const { PACE_PROGRAMS, UNSECURED_PROGRAMS, SUBSCRIBERS } = require('./constants');

const PostToSpecificService = require('../proxies/post_to_specific_service'); // Assuming this is a custom class

const RecipientWrapper = require('../models/recipient_wrapper');

// Bull queue for processing update service recipient jobs
const updateServiceRecipientQueue = new Queue('update_service_recipient');

// Custom Error class for ServiceFailure
class ServiceFailure extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServiceFailure';
  }
}

// Perform function for updating service recipient
async function perform(recipientHash, program) {
  const docusignRecipient = new RecipientWrapper(recipientHash);

  // Send to service and get the response
  const serviceResponse = await sendToService(docusignRecipient, program);
  const responseStatus = serviceResponse?.status || 0;

  // Check for success status (between 200 and 399)
  if (responseStatus < 200 || responseStatus >= 400) {
    throw new ServiceFailure(`ERROR RESPONSE: ${serviceResponse.data}`);
  }
}

// Function to send data to the service
async function sendToService(docusignRecipient, program) {
  const serviceData = {
    email: docusignRecipient.email,
    name: docusignRecipient.name,
    contractor_user_identifier: docusignRecipient.identifier
  };

  let servicePath;
  if (PACE_PROGRAMS.includes(program)) {
    program = 'california_first';
    servicePath = `/api/v2/docusign/recipient/${docusignRecipient.envelope_identifier}/${docusignRecipient.identifier}`;
  } else if (UNSECURED_PROGRAMS.includes(program)) {
    program = 're_home';
    servicePath = `/api/docusign/${docusignRecipient.envelope_identifier}`;
  } else {
    throw new Error('No program_identifier provided');
  }

  // Proxy call to the service
  const proxyInstance = proxy(program, servicePath);
  return await proxyInstance.postPayload(JSON.stringify(serviceData));
}

// Function to create a proxy service
function proxy(program, path) {
  return new PostToSpecificService({
    name: program,
    subscribers: SUBSCRIBERS,
    overridePath: path,
    extraHeaders: { 'Content-Type': 'application/json' }
  });
}

// Adding the perform function to the Bull Queue
updateServiceRecipientQueue.process(async (job) => {
  const { recipientHash, program } = job.data;
  await perform(recipientHash, program);
});

module.exports = {
  updateServiceRecipientQueue
};
