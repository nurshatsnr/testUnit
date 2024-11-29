const { AppConfig } = require("../../commons/environment/appconfig");
const axios = require("axios");
const { log } = require("../../commons/utils/logger");
const jwt = require('jsonwebtoken');
const { connectClient } = require("./db/db");

const getKey = (header, callback) => {
    axios.get('https://renew-dev.auth0.com/.well-known/jwks.json')
        .then(response => {
            // Find the signing key with matching `kid`
            const signingKey = response.data.keys.find(key => key.kid === header.kid);
            if (signingKey) {
                const publicKey = signingKey.x5c[0];
                // Format the public key correctly
                const formattedKey = `-----BEGIN CERTIFICATE-----\n${publicKey}\n-----END CERTIFICATE-----`;
                callback(null, formattedKey);
            } else {
                callback(new Error('Unable to find the signing key'));
            }
        })
        .catch(error => {
            log.error('Error fetching JWKS:', error);
            callback(error);
        });
};

// Token verification function
const verifyApiToken = async (token, client) => {
    try {
        if(!client) throw new Error("CLIENT NOT AVAILABLE");
        const query = `SELECT identifier FROM partners WHERE api_token = $1`;
       
        const result = await client.query(query, [token]);
        // console.log("VERIFY API TOKEN RESULT ",result);
        return result.rows.length > 0 ? result.rows[0].identifier : null;
    } catch (error) {
        log.error('Error verifying API token:' + JSON.stringify(error));
        throw error;
    }
};

const checkUserAuthorization = async (token, identifier) => {
    log.debug(`Identifier is ${identifier}`);
    // Wrap jwt.verify in a Promise
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            audience: 'https://renew-dev.auth0.com/api/v2/',
            issuer: 'https://renew-dev.auth0.com/',
            algorithms: ['RS256']
        }, (err, decoded) => {
            if (err) {
                console.log(err);
                resolve({ status: 'error', message: 'Authorization failed' });
            } else {
                console.log(decoded);
                resolve({ status: 'success', message: 'Authorization successful', user: decoded });
            }
        });
    });
};



module.exports = { verifyApiToken, checkUserAuthorization }
