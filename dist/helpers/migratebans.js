const { BannedPlayers } = require("./sqlitedb");
const bannedPlayers = require("../banlist-full.json");
const run = async () => {
    // this is "truncating"
    await BannedPlayers.truncate();
    const players = new Map();
    bannedPlayers.forEach((player) => players.set(player.username, true));
    const bans = Array.from(players.keys()).map((player) => {
        return {
            playername: player,
            reason: "Defer your ban at http://awf.yt",
        };
    });
    await BannedPlayers.bulkCreate(bans);
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