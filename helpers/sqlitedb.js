const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: () => {},
});

class ExtraBans extends Model {}
ExtraBans.init(
  {
    playername: DataTypes.STRING,
    reason: DataTypes.STRING,
  },
  { sequelize, modelName: "extraBans" }
);

class BannedPlayers extends Model {}
BannedPlayers.init(
  {
    playername: DataTypes.STRING,
    reason: DataTypes.STRING,
  },
  { sequelize, modelName: "bannedPlayers" }
);

module.exports = {
  sequelize,
  ExtraBans,
  BannedPlayers,
};

sequelize.sync();
