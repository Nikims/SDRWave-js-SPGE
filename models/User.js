const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      unique: false,
      defaultValue: false,
    },
    isTunedToVirtual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      unique: false,
      defaultValue: false,
    },
    bio:{
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    tunedStationID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    likedVStationsIDs: {
      type: DataTypes.JSON, // Assuming likedVStationsIDs is an array of IDs
    },
    hashedPassword: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, //todo change if ever write verifications
    },
    friendRequests: {
      type: DataTypes.JSON, 
      defaultValue:[]
    },
  },
  {},
);
User.sync();
module.exports=User