const sequelize = require("../db/db");
const DataTypes = require("sequelize/lib/data-types");
const User=require("./User")
const Friendship = sequelize.define(
    'Friendship',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      userId1: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userId2: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {}
  );
  
  // Define associations
  // User.belongsToMany(User, {
  //   through: Friendship,
  //   as: 'Friend',
  //   foreignKey: 'userId1',
  // });
  
  // Friendship.belongsTo(User, { foreignKey: 'userId1', as: 'user1' });
  // Friendship.belongsTo(User, { foreignKey: 'userId2', as: 'user2' });
  
  Friendship.sync();
  
  module.exports = Friendship;
  