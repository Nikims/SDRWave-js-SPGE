const sequelize = require('../db/db');
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

Friendship.sync();

module.exports = Friendship;