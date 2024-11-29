const axios = require('axios'); // Axios is used for making HTTP requests
const qs = require('qs'); // Used to handle URL encoding of payloads

export class Sender {
  constructor({ payload, subscriber, extraHeaders = {}, overridePath = null }) {
    this.payload = payload;
    this.subscriber = subscriber; // Assuming subscriber keys are already in camelCase
    this.host = this.subscriber.host;
    this.path = overridePath || this.subscriber.path;
    this.token = this.subscriber.token;
    this.version = this.subscriber.version;
    this.extraHeaders = extraHeaders;
  }

  async deliver() {
    console.log("SENDER CONFIGS ",{
      payload : this.payload,
      subscriber : this.subscriber,
      host : this.subscriber.host
    })
    try {
      const response = await this.connection().post(this.path || '/', qs.stringify(this.payload), {
        headers: this.headers()
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error delivering the payload:', error.message);
    }
  }

  connection() {
    return axios.create({
      baseURL: this.host,
      maxRedirects: 5 // Equivalent to Faraday's redirect follow functionality
    });
  }

  headers() {
    const headersToSend = {};
    if (this.token) {
      headersToSend['Api-Token'] = this.token;
    }
    if (this.version) {
      headersToSend['Api-Version'] = this.version;
    }
    return { ...headersToSend, ...this.extraHeaders };
  }
}

