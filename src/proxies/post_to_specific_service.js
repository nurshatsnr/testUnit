// Import external functions
const { Sender } = require('./sender'); // Assuming Sender is defined in sender.js

class PostToSpecificService {
  constructor({ name, subscribers, overridePath = null, extraHeaders = {} }) {
    this.name = name;
    this.subscribers = subscribers;
    this.overridePath = overridePath;
    this.extraHeaders = extraHeaders;
    this._target = null;

    this.validate();
  }

  postPayload(payload) {
    this.sender(payload).deliver();
  }

  validate() {
    if (!Array.isArray(this.subscribers)) {
      throw new Error('subscribers must be an Array');
    }
    if (this.subscribers.length === 0) {
      throw new Error('subscribers must not be empty');
    }
    if (this.target() === null) {
      throw new Error(`${this.name} is not a configured service`);
    }
  }

  target() {
    if (!this._target) {
      this._target = this.subscribers.find(subscriber => subscriber.name === this.name);
    }
    return this._target;
  }

  sender(payload) {
    return new Sender({
      payload: payload,
      subscriber: this.target(),
      extraHeaders: this.extraHeaders,
      overridePath: this.overridePath
    });
  }
}

module.exports = PostToSpecificService;
