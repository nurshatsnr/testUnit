const { DataTypes, Model } = require('sequelize');
const { parseStringPromise } = require('xml2js'); // XML to JSON parser
const { sequelizeConn } = require('../database'); // Assuming you have a database connection setup

class ConnectMessage extends Model {
  // Method to convert XML payload to a hash (equivalent to `Hash.from_xml(xml_payload)` in Ruby)
  async toHash() {
    try {
      const result = await parseStringPromise(this.xml_payload, { explicitArray: false });
      return result;
    } catch (err) {
      console.error('Error parsing XML:', err);
      throw err;
    }
  }
}

// Define the ConnectMessage model
ConnectMessage.init({
  envelope_uuid: {
    type: DataTypes.UUID, // Assuming UUID type; use STRING if it is a string
    allowNull: false,     // Not null constraint
  },
  xml_payload: {
    type: DataTypes.TEXT, // Assuming the XML is stored as text
    allowNull: false,     // Not null constraint
  },
  program_identifier: {
    type: DataTypes.STRING, // Use STRING for program identifier
    allowNull: false,       // Not null constraint
  },
  generated_at: {
    type: DataTypes.DATE,   // Assuming this is a timestamp
    allowNull: false,       // Not null constraint
  },
  most_recent_status_entered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at', // Specify the column name in the database
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at', // Specify the column name in the database
  },
  docu_sign_envelope_id: {
    type: DataTypes.INTEGER, // Assuming this is an integer foreign key to an envelope table
    allowNull: true,
    references: {
      model: 'envelopes', // Name of the table that holds the envelopes
      key: 'id',
    },
  },
}, {
  sequelize: sequelizeConn, // Database connection instance
  modelName: 'ConnectMessage',
  tableName: 'docu_sign_connect_messages', // Set the actual table name
  timestamps: false, // Disable automatic timestamps (createdAt, updatedAt)
  defaultScope: {
    order: [['most_recent_status_entered_at', 'DESC']], // Order by most_recent_status_entered_at DESC by default
  },
});

// Define the association (assuming the existence of an Envelope model)
ConnectMessage.associate = models => {
  ConnectMessage.belongsTo(models.Envelope, {
    foreignKey: 'docu_sign_envelope_id',
    as: 'envelope', // Optional alias
  });
};

module.exports = ConnectMessage;
