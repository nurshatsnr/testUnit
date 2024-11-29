const { DataTypes, Model } = require('sequelize');
const Status = require('./status'); // Import the Status model
const { sequelizeConn } = require('../database');

class Recipient extends Model {
  // Method to return only the exported attributes (equivalent to `slice` in Ruby)
  exportedAttributes() {
    return {
      identifier: this.identifier,
      client_user_id: this.client_user_id,
      name: this.name,
      email: this.email,
      routing_order: this.routing_order,
      recipient_type: this.recipient_type,
    };
  }

  // Overriding `toJSON` method (equivalent to `as_json` in Ruby)
  toJSON() {
    return {
      ...this.exportedAttributes(),
      statuses: this.statuses ? this.statuses.map(status => status.toJSON()) : [],
    };
  }
}

// Define the Recipient model
Recipient.init({
  identifier: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client_user_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  routing_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recipient_type: {
    type: DataTypes.STRING, // Assuming recipient_type is stored as a string
    allowNull: false,
  },
  docu_sign_envelope_id: {
    type: DataTypes.INTEGER, // Foreign key to Envelope model
    allowNull: true,
    references: {
      model: 'envelopes', // Table name for Envelope
      key: 'id',
    },
  },
}, {
  sequelize : sequelizeConn, // Database connection instance
  modelName: 'Recipient',
  tableName: 'docu_sign_recipients', // Set the actual table name
});

// Associations
Recipient.associate = models => {
  Recipient.belongsTo(models.Envelope, {
    foreignKey: 'docu_sign_envelope_id',
    as: 'envelope',
  });

  Recipient.hasMany(models.Status, {
    foreignKey: 'tracked_id', // Foreign key for polymorphic relation
    constraints: false,
    scope: {
      tracked_type: 'Recipient', // Set the tracked_type to 'Recipient'
    },
    as: 'statuses',
  });
};

module.exports = Recipient;
