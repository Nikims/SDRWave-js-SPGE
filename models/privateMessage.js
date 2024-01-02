const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");
const User= require("./User")
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
    messageContent: {
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
privateMessage.beforeCreate(async (msg,options)=>{
  msg.senderUsername = User.findByPk(msg.user1)
})

privateMessage.sync();
module.exports=privateMessage