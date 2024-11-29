import { log } from '../commons/utils/logger';
const pg = require("pg");
const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
export const sequelizeConn = new Sequelize(process.env.POSTGRES_DATABASE, process.env.POSTGRES_USERNAME, process.env.POSTGRES_PASSWORD, {
  host: process.env.POSTGRES_SERVICE_HOST,
  dialect: 'postgres',
  dialectModule : pg,
  logging: console.log, // Set to false to disable logging
});

// Test the connection
async function testConnection() {
  try {
    console.log("AUTHENTICATING SEQUELIZE PG");
    console.log(process.env.POSTGRES_DATABASE,process.env.POSTGRES_SERVICE_HOST);

    await sequelizeConn.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Export the sequelize instance and test the connection
testConnection();
