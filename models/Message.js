const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");

const Message = sequelize.define(
  "Message",
  {
    senderUsername: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "John Doe",
    },
    messageID: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,  
    },
    senderID: {
      type: DataTypes.UUID,  
      allowNull: false,
    },
    messageContent: {
      type: DataTypes.TEXT, 
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,  
      allowNull: false,
    },
    radioStationID: {
      type: DataTypes.UUID,  
      allowNull: false,
    },
  },
  {
  },
);


Message.sync();
