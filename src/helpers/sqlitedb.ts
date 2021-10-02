import {
  Sequelize,
  Model,
  DataType,
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "../database.sqlite",
  logging: () => {},
});

// export interface ExtraBansAttributes {
//   id: number;
//   playername: string;
//   reason: string;
// }

// class ExtraBans extends Model {
//   id: number;
//   playername: string;
//   reason: string;
// }
// ExtraBans.init(
//   {
//     playername: DataTypes.STRING,
//     reason: DataTypes.STRING,
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//   },
//   { sequelize, modelName: "extraBans" }
// );

// export interface BannedPlayersAttributes {
//   id: number;
//   playername: string;
//   reason: string;
// }
// class BannedPlayers extends Model {
//   public id!: number;
//   public playername!: string;
//   public reason!: string;
// }
// BannedPlayers.init(
//   {
//     playername: DataTypes.STRING,
//     reason: DataTypes.STRING,
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//   },
//   { sequelize, modelName: "bannedPlayers" }
// );

@Table({
  tableName: "extraBans",
})
class ExtraBans extends Model {
  @Column(DataType.STRING)
  get playername(): string {
    return this.getDataValue("playername");
  }

  @Column(DataType.STRING)
  get reason(): string {
    return this.getDataValue("reason");
  }
}

@Table({
  tableName: "bannedPlayers",
})
class BannedPlayers extends Model {
  @Column(DataType.STRING)
  get playername(): string {
    return this.getDataValue("playername");
  }

  @Column(DataType.STRING)
  get reason(): string {
    return this.getDataValue("reason");
  }
}

sequelize.addModels([ExtraBans, BannedPlayers]);

export { BannedPlayers, ExtraBans };

sequelize.sync();
