const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");
const Song = sequelize.define(
  "Song",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
RadioStation.sync();
