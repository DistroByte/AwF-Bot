"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sqlitedb_1 = require("./sqlitedb");
const banlist_full_json_1 = (0, tslib_1.__importDefault)(require("../../banlist-full.json"));
const run = async () => {
    // this is "truncating"
    await sqlitedb_1.BannedPlayers.truncate();
    const players = new Map();
    banlist_full_json_1.default.forEach((player) => players.set(player.username, true));
    const bans = Array.from(players.keys()).map((player) => {
        return {
            playername: player,
            reason: "Defer your ban at http://awf.yt",
        };
    });
    await sqlitedb_1.BannedPlayers.bulkCreate(bans);
    // await Promise.all(Array.from(players.keys()).map(async (player, i) =>
    //   {
    // await prisma.bannedPlayers.create({
    //       data: {
    //         playername: player
    //       },
    //     })
    //   }
    // ))
    return true;
};
module.exports = run;
//# sourceMappingURL=migratebans.js.map