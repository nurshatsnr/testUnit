const { Job } = require('bull'); // Using Bull to interact with jobs in the queue

class DelayedJob {
  constructor(queue) {
    this.queue = queue;
  }

  // Method to find a job by its job_id (simulating Delayed::Job.find_one in Ruby)
  async findOne(query) {
    const { job_id } = query;

    // Get the job by ID from the Bull queue
    const job = await this.queue.getJob(job_id);
    return job;
  }

  // Method to destroy (remove) a job from the queue
  async destroy(job) {
    if (job) {
      await job.remove(); // This will remove the job from the Bull queue
    }
  }
}

module.exports = DelayedJob;
