const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");

const Playlist = sequelize.define(
    'Playlist',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ownerId:{
        type:DataTypes.STRING,
        allowNull:false,
      },
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      songs: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
    },
    {},
  );
  
  Playlist.sync();
  
  module.exports = Playlist;
  