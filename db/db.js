const { Sequelize } = require("sequelize");

let sequelize = null;

if (!sequelize) {
  sequelize = new Sequelize({
    logging:false,
    dialect: "sqlite",
    storage: "./db/database.sqlite",
    define: { freezeTableName: true },
  });
}

module.exports = sequelize;
