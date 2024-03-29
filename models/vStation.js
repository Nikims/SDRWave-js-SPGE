const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");
const vStation = sequelize.define(
  "vStation",
  {
    // Model attributes for the Radio Station
    isSDR: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    currentListeners: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    currentIndex:{
      type:DataTypes.INTEGER,
      defaultValue:0,
    },
    isBusy: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    },
    Songs: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    id: {
      type: DataTypes.UUID, // You can use UUID as the ID type
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    StationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    StationDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    topSongs: {
      type: DataTypes.JSON,
      allowNull: true, // Assuming topSongs is an array of songs
    },
  },
  {},
  {
    // Other model options go here
  },
);
vStation.sync({ force: false });
// You can add more options and validation as needed for your RadioStation model.
