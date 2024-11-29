const { DataTypes, Model } = require('sequelize');
const { sequelizeConn } = require('../database');

class Status extends Model {
  // Method to return only the exported attributes (equivalent to `slice` in Ruby)
  exportedAttributes() {
    return {
      name: this.name,
      entered_at: this.entered_at,
    };
  }

  // Overriding `toJSON` method (equivalent to `as_json` in Ruby)
  toJSON() {
    return {
      name: this.name,
      entered_at: this.entered_at,
    };
  }
}

// Define the Status model
Status.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entered_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  tracked_id: {
    type: DataTypes.INTEGER, // Foreign key for polymorphic association
    allowNull: true,
  },
  tracked_type: {
    type: DataTypes.STRING, // Stores the type ('Recipient' or 'Envelope')
    allowNull: true,
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
}, {
  sequelize : sequelizeConn, // Database connection instance
  modelName: 'Status',
  tableName: 'docu_sign_statuses', // Set the actual table name,
  timestamps : false
});

// Associations (Polymorphic)
Status.associate = models => {
  // Polymorphic association for Recipient
  Status.belongsTo(models.Recipient, {
    foreignKey: 'tracked_id',
    constraints: false,
    scope: {
      tracked_type: 'Recipient',
    },
    as: 'recipient',
  });

  // Polymorphic association for Envelope
  Status.belongsTo(models.Envelope, {
    foreignKey: 'tracked_id',
    constraints: false,
    scope: {
      tracked_type: 'Envelope',
    },
    as: 'envelope',
  });
};

module.exports = Status;
