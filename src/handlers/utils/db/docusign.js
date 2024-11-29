const { Client } = require('pg'); // Assuming PostgreSQL for the database
const { AppConfig } = require('../../../commons/environment/appconfig');

// Simulate saving to a PostgreSQL database (replace with actual database logic)
export const docuSign_saveToDb = async (connectMessage, envelopeStatus, recipients) => {
    const client = new Client({
      host: AppConfig.POSTGRES_DB.POSTGRES_SERVICE_HOST,
      user: AppConfig.POSTGRES_DB.POSTGRES_USERNAME,
      password: AppConfig.POSTGRES_DB.POSTGRES_PASSWORD,
      database: AppConfig.POSTGRES_DB.POSTGRES_DATABASE,
      port: AppConfig.POSTGRES_DB.POSTGRES_SERVICE_PORT,
        ssl: AppConfig.environment === 'prod' ? false : { rejectUnauthorized: false }
    });
  
    try {
      await client.connect();
  
      const query = `
        INSERT INTO docu_sign_connect_messages (connect_message, envelope_status, recipients)
        VALUES ($1, $2, $3)
        RETURNING id;
      `;
  
      const result = await client.query(query, [connectMessage, envelopeStatus, recipients]);
  
      await client.end();
      return result.rows[0].id;
    } catch (error) {
      logger.error('Database save failed', { error: error.message });
      throw new Error('Database save failed');
    }
  };