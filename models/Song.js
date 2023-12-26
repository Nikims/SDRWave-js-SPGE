const sequelize = require("../db/db");
const { Op } = sequelize.Sequelize;
const DataTypes = require("sequelize/lib/data-types");
const Song = sequelize.define(
  "Song",
  {
    discoveryDate:{
      type:DataTypes.DATE,
      default:Date.now()
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sampleId:{
      type: DataTypes.INTEGER,
      defaultValue: 1,
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
Song.destroy({
  where: {
    name: {
      [Op.like]: '%Sample Song%',
    }
  }
})
.then(numDeleted => {
  console.log(`Deleted ${numDeleted} rows`);
})
.catch(err => {
  console.error('Error occurred while deleting:', err);
});
Song.sync();
