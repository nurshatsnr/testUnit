const Sender = require('./sender'); // Import the Sender class

class PostPayloadAsBodyBroadcaster {
  constructor(subscribers) {
    this.subscribers = subscribers || [];
    this.extraHeaders = {}; // Initialize extraHeaders if needed
    this.validate();
  }

  async postPayload(payload) {
    let response = null;

    // Sort subscribers by name
    const sortedSubscribers = this.subscribers.sort((a, b) => a.name.localeCompare(b.name));
    
    for (const subscriber of sortedSubscribers) {
      response = await this.sender(payload, subscriber).deliver();

      // Break if subscriber's name matches and response status is less than 400
      if (subscriber.name.includes('re_home') && response.status < 400) {
        break;
      }
    }
    return response;
  }

  validate() {
    if (!Array.isArray(this.subscribers)) {
      throw new Error('subscribers must be an Array');
    }
    if (this.subscribers.length === 0) {
      throw new Error('subscribers must not be empty');
    }
  }

  sender(payload, subscriber) {
    return new Sender({
      payload,
      subscriber,
      extraHeaders: this.extraHeaders,
    });
  }
}

module.exports = PostPayloadAsBodyBroadcaster;
