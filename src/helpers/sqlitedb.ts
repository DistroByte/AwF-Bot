import { Sequelize, Model, DataTypes, Optional } from "sequelize";
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: () => {},
});

export interface ExtraBansAttributes {
  id: number
  playername: string,
  reason: string
}

class ExtraBans extends Model<ExtraBansAttributes, Optional<ExtraBansAttributes, "id">> {
  playername!: string
  reason!: string
}
ExtraBans.init(
  {
    playername: DataTypes.STRING,
    reason: DataTypes.STRING,
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  { sequelize, modelName: "extraBans" }
);

export interface BannedPlayersAttributes {
  id: number
  playername: string,
  reason: string
}
class BannedPlayers extends Model<BannedPlayersAttributes, Optional<BannedPlayersAttributes, "id">> {
  playername!: string
  reason!: string
}
BannedPlayers.init(
  {
    playername: DataTypes.STRING,
    reason: DataTypes.STRING,
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  { sequelize, modelName: "bannedPlayers" }
);
export {BannedPlayers, ExtraBans}


sequelize.sync();
