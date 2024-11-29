const { DataTypes, Model } = require('sequelize');

const ConnectMessage = require('./connect_message'); // Import the ConnectMessage model
const Recipient = require('./recipient'); // Import the Recipient model
const Status = require('./status'); // Import the Status model
const { sequelizeConn } = require('../database');

class Envelope extends Model {
  // Overriding the `toJSON()` method (equivalent to `as_json` in Ruby)
  toJSON() {
    return {
      envelope_uuid: this.envelope_uuid,
      recipients: this.recipients ? this.recipients.map(recipient => recipient.toJSON()) : [],
      statuses: this.statuses ? this.statuses.map(status => status.toJSON()) : []
    };
  }
}

// Define the Envelope model
Envelope.init({
  envelope_uuid: {
    type: DataTypes.STRING, // Assuming it's a UUID or some identifier
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at' // Specify the column name in the database
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at' // Specify the column name in the database
  },
  // Other attributes specific to your Envelope model can go here
}, {
  sequelize : sequelizeConn, // Database connection instance
  modelName: 'Envelope',
  tableName: 'docu_sign_envelopes', // Set the actual table name
  timestamps : false
});

// Associations
Envelope.associate = models => {
  Envelope.hasMany(models.ConnectMessage, {
    foreignKey: 'docu_sign_envelope_id',
    as: 'connect_messages',
  });

  Envelope.hasMany(models.Recipient, {
    foreignKey: 'docu_sign_envelope_id',
    as: 'recipients',
  });

  Envelope.hasMany(models.Status, {
    foreignKey: 'tracked_id', // Assuming tracked polymorphic relation if it exists
    constraints: false,
    scope: {
      tracked_type: 'Envelope',
    },
    as: 'statuses',
  });
};

module.exports = Envelope;
