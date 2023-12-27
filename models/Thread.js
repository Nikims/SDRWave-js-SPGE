const sequelize = require("../db/db");
const { Op } = sequelize.Sequelize;
const DataTypes = require("sequelize/lib/data-types");
const User = require("./User");

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
    posterUsername:{
      type:DataTypes.STRING,
      default:null
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
Thread.beforeCreate(async (instance, options) => {
  // Check if postedBy is present and set posterUsername accordingly
  console.log('Before create hook is running!');
  if (instance.postedBy) {
      // Assuming you have a method to fetch the username based on the postedBy value
      const username = await User.findByPk(instance.postedBy);
      instance.posterUsername = username.username;
  }
});

Thread.sync()
module.exports=Thread