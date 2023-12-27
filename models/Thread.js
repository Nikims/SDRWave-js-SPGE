const sequelize = require("../db/db");
const { Op } = sequelize.Sequelize;
const DataTypes = require("sequelize/lib/data-types");
const Thread = sequelize.define("Thread",
  {
    postDate:{
      type:DataTypes.DATE,
      default:Date.now()
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postedOn:{
        type:DataTypes.UUID,
        allowNull:false,
    },
    postedBy:{
        type:DataTypes.UUID,
        allowNull:false,
    },
    replies:{
        type:DataTypes.JSON,
        defaultValue:[],
        allowNull:false,
    },
    id:{
      primaryKey:true,
      type:DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false,
    },
  },
  {},
);
Thread.sync()
module.exports=Thread