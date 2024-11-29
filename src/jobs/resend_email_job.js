const { Hancock, EnvelopeLockedError } = require('./hancock'); // Assuming Hancock and custom errors are defined elsewhere

const DelayedJob = require('./delayedJob'); // Abstracted delayed job functionality
const RecipientWrapper = require('../models/recipient_wrapper'); // Assuming this model is defined
const Queue = require('bull'); // Bull queue for processing resend email jobs
const { log } = require('../commons/utils/logger');

const resendEmailQueue = new Queue('resend_email'); // Queue name

// Constant for filtered recipient attributes (PII like name and email)
const FILTERED_RECIPIENT_ATTRIBUTES = ['name', 'email'];

// Function to filter out PII (personal information) from the recipient hash
function filteredRecipient(recipientHash) {
  return Object.fromEntries(
    Object.entries(recipientHash).filter(([key]) => !FILTERED_RECIPIENT_ATTRIBUTES.includes(key))
  );
}

// Perform function similar to ActiveJob's perform method in Ruby
async function perform(recipientHash) {
  const recipientWrapper = new RecipientWrapper(recipientHash);

  try {
    // Attempt to resend email
    await recipientWrapper.hancockRecipient().resendEmail();
  } catch (e) {
    if (e instanceof Hancock.RequestError) {
      const lockedBy = await new Hancock.Envelope({
        identifier: recipientWrapper.envelopeIdentifier(),
      }).getLock();

      throw new EnvelopeLockedError({
        recipient_hash: JSON.stringify(recipientHash),
        locked_by: lockedBy,
        exception: e,
      });
    } else if (e instanceof Hancock.Recipient.ResendEmailError) {
      // Log the error with the filtered recipient info
      log.error({
        recipient: JSON.stringify(filteredRecipient(recipientHash)),
        exception: e,
      });

      // Cancel the job using the job_id equivalent, search and remove job from DelayedJob queue
      const delayedJob = new DelayedJob(resendEmailQueue);
      const job = await delayedJob.findOne({ job_id: resendEmailQueue.id });
      if (job) {
        await delayedJob.destroy(job);
      }
    } else {
      throw e; // Rethrow unknown errors
    }
  }
}

// Adding the perform function to Bull Queue
resendEmailQueue.process(async (job) => {
  await perform(job.data.recipientHash);
});

module.exports = {
  resendEmailQueue,
};
