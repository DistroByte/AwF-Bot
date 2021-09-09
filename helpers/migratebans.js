const prisma = require("./prismadb")
const bannedPlayers = require("../banlist-full.json")

const run = async () => {
  // this is "truncating"
  await prisma.$executeRaw`Delete from bannedPlayers;`
  await prisma.$executeRaw`DELETE FROM SQLITE_SEQUENCE WHERE name='bannedPlayers';`
  const players = new Map()
  bannedPlayers.forEach(player => players.set(player.username, true))
  await Promise.all(Array.from(players.keys()).map(async (player, i) => 
    {
      await prisma.bannedPlayers.create({
        data: {
          playername: player
        }
      })
    }
  ))
  return true
}

module.exports = run