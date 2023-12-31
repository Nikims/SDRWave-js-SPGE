const sequelize = require('../db/db');
const {Op} = require('sequelize');

const DataTypes = require("sequelize/lib/data-types");
const User = require("./User");

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
    user1: {
      type: DataTypes.UUID,
      foreignKey: true,
    },
    user2: {
      type: DataTypes.UUID,
      foreignKey: true,
    },
    
  },
  {},
);
Friendship.beforeCreate(async (friendship, options) => {
  const existingFriendship = await Friendship.findOne({
    where: {
      [Op.or]: [
        { user1: friendship.user1, user2: friendship.user2 },
        { user1: friendship.user2, user2: friendship.user1 },
      ],
    },
  });

  if (existingFriendship) {
    throw new Error('Friendship already exists.');
  }
});

Friendship.sync();

module.exports = Friendship;