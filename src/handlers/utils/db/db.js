const { Client } = require('pg');
const { log } = require('../../../commons/utils/logger');
const { AppConfig } = require('../../../commons/environment/appconfig');

let client;

// Function to initialize or reuse the existing client connection

const connectClient = async () => {
    try {
        log.debug("CONNECTING TO PG " + process.env.POSTGRES_SERVICE_HOST)
        if (!client) {
            client = new Client({
                host: AppConfig.POSTGRES_DB.POSTGRES_SERVICE_HOST,
                user: AppConfig.POSTGRES_DB.POSTGRES_USERNAME,
                password: AppConfig.POSTGRES_DB.POSTGRES_PASSWORD,
                database: AppConfig.POSTGRES_DB.POSTGRES_DATABASE,
                port: AppConfig.POSTGRES_DB.POSTGRES_SERVICE_PORT,
                ssl: AppConfig.environment === 'prod' ? false : { rejectUnauthorized: false }
            });
            await client.connect();
            console.log('Database connected');
        }
        return client;  // Return the client instance
    } catch (e) {
        log.debug("Could not connect pg client " + JSON.stringify(e));
        throw e
    }
};

module.exports = { connectClient , client};
