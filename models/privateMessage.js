const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");

const privateMessage = sequelize.define(
  "privateMessage",
  {
    user1:{
        type: DataTypes.UUID,
        allowNull: false,
        unique: false,
        defaultValue: DataTypes.UUIDV4,
    },
    user2:{
        type: DataTypes.UUID,
        allowNull: false,
        unique: false,
        defaultValue: DataTypes.UUIDV4,
    },
    sentBy:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:1
    },
    privateMessageID: {
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
    privateMessageContent: {
      type: DataTypes.TEXT, 
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,  
      allowNull: false,
      defaultValue:DataTypes.NOW
    },
  },
  {
  },
);


privateMessage.sync();
