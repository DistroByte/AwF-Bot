import { BannedPlayers } from "./sqlitedb";
import { readFile } from "fs/promises";

interface BannedPlayer {
  username: string
  reason: string
}

const run = async () => {
  // this is "truncating"
  await BannedPlayers.truncate();

  const players = new Map();
  const bannedPlayersFile: BannedPlayer[] = await readFile("../banlist-full.json", "utf-8").then(r=>JSON.parse(r))
  bannedPlayersFile.forEach((player) => players.set(player.username, true));

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
