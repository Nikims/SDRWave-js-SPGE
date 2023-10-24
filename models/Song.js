const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");
const Song = sequelize.define(
  "Song",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id:{
      primaryKey:true,
      type:DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false,
    },
    likes:{
      type:DataTypes.JSON,
      allowNull:false,
      defaultValue:[],
    },
    artist:{
      type:DataTypes.STRING,
      allowNull:true,
    },
    discoveredLiveCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    frequencyDiscoveredOn: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    RadioStationDiscoveredOn: {
      type: DataTypes.UUID,
    },
  },
  {},
);
Song.sync();
