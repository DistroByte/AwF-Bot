"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannedPlayers = exports.ExtraBans = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
exports.sequelize = new sequelize_1.Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: () => { },
});
class ExtraBans extends sequelize_1.Model {
}
exports.ExtraBans = ExtraBans;
ExtraBans.init({
    playername: sequelize_1.DataTypes.STRING,
    reason: sequelize_1.DataTypes.STRING,
}, { sequelize: exports.sequelize, modelName: "extraBans" });
class BannedPlayers extends sequelize_1.Model {
}
exports.BannedPlayers = BannedPlayers;
BannedPlayers.init({
    playername: sequelize_1.DataTypes.STRING,
    reason: sequelize_1.DataTypes.STRING,
}, { sequelize: exports.sequelize, modelName: "bannedPlayers" });
exports.sequelize.sync();
//# sourceMappingURL=sqlitedb.js.map