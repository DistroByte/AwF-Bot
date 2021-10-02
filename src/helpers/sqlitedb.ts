import { Sequelize, Model, DataTypes } from "sequelize";
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: () => {},
});

export class ExtraBans extends Model {}
ExtraBans.init(
  {
    playername: DataTypes.STRING,
    reason: DataTypes.STRING,
  },
  { sequelize, modelName: "extraBans" }
);

export class BannedPlayers extends Model {}
BannedPlayers.init(
  {
    playername: DataTypes.STRING,
    reason: DataTypes.STRING,
  },
  { sequelize, modelName: "bannedPlayers" }
);



sequelize.sync();
