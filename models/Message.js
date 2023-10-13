const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");

const Message = sequelize.define(
  "Message",
  {
    messageID: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true, // This column will be the primary key
    },
    senderID: {
      type: DataTypes.UUID, // Assuming senderID is a UUID
      allowNull: false,
    },
    messageContent: {
      type: DataTypes.TEXT, // You can use TEXT for longer message content
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE, // Assuming timestamp is a date
      allowNull: false,
    },
    radioStationID: {
      type: DataTypes.UUID, // Assuming radioStationID is a UUID
      allowNull: false,
    },
  },
  {
    // Additional model configurations if needed
  },
);

// You can add any other specific configurations or associations here if needed.

Message.sync(); // This will create the "Message" table in your database
