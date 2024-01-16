const { Sequelize } = require("sequelize");

let sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./db/database.sqlite",
    define: { freezeTableName: true },
});

module.exports = sequelize;
