const { Sequelize } = require("sequelize");

let sequelize = null;

if (!sequelize) {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./db/database.sqlite",
  });
}

module.exports = sequelize;
