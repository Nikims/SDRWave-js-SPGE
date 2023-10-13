const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");
const vStation = sequelize.define(
  "vStation",
  {
    // Model attributes for the Radio Station
    currentListeners: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    },
    topSongs: {
      type: DataTypes.JSON, // Assuming topSongs is an array of songs
    },
  },
  {
    // Other model options go here
  },
);
vStation.sync();
// You can add more options and validation as needed for your RadioStation model.
