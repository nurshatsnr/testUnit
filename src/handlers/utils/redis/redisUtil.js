import { log, logger } from '../../../commons/utils/logger';

const redis = require('redis');
const crypto = require('crypto');
const client = redis.createClient();

// Function to encrypt the access token
export function encryptToken(token) {
  const cipher = crypto.createCipher('aes-256-cbc', 'your-secret-key');
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Function to decrypt the access token
export function decryptToken(encryptedToken) {
  const decipher = crypto.createDecipher('aes-256-cbc', 'your-secret-key');
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Function to save the token to Redis
export function saveTokenToCache(key, token, expiry) {
  const encryptedToken = encryptToken(token);
  client.setex(key, expiry, encryptedToken, (err) => {
    if (err) throw err;
    log('Token saved to cache with expiry:', expiry);
  });
}

// Function to retrieve the token from Redis
function getTokenFromCache(key, callback) {
  client.get(key, (err, encryptedToken) => {
    if (err) throw err;
    if (encryptedToken) {
      const token = decryptToken(encryptedToken);
      callback(null, token);
    } else {
      callback(new Error('Token not found in cache'));
    }
  });
}

// Example usage
const accessToken = 'your-access-token';
const expiry = 3600; // Token expiry in seconds

// Save the token when the first request is received
saveTokenToCache('accessTokenKey', accessToken, expiry);

// Reuse the token from the cache for subsequent requests
getTokenFromCache('accessTokenKey', (err, token) => {
  if (err) {
    console.error(err);
  } else {
    logger('Retrieved token from cache:', token);
  }
});
