const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");
const RadioStation = sequelize.define(
  "RadioStation",
  {
    // Model attributes for the Radio Station
    currentListeners: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    id: {
      type: DataTypes.UUID, // You can use UUID as the ID type
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hostSource: {
      type: DataTypes.STRING,
      defaultValue: "http://localhost:8080",
    },
    tunedFrequency: {
      type: DataTypes.FLOAT,
    },
    StationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    StationDescription: {
      type: DataTypes.STRING,
    },
    allowFreeTuning: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tunableRangeMin: {
      type: DataTypes.FLOAT,
      defaultValue: 86,
    },
    tunableRangeMax: {
      type: DataTypes.FLOAT,
      defaultValue: 105,
    },
    topSongs: {
      type: DataTypes.JSON, // Assuming topSongs is an array of songs
    },
  },
  {
    // Other model options go here
  },
);
RadioStation.sync();
// You can add more options and validation as needed for your RadioStation model.
