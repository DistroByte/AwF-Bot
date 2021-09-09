const Command = require("../../base/Command.js");
const { removeban } = require("../../helpers/functions")
const rcon = require("../../helpers/rcon")

class Unbanplayer extends Command {
  constructor(client) {
    super(client, {
      name: "unbanplayer",
      description: "Unban a player",
      usage: "[playername]",
      aliases: ["unban"],
      examples: ["{{p}}unbanplayer oof2win2"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: ["BAN_MEMBERS"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000,
    });
  }

  async run(message, args) {
    if (!args[0]) return message.channel.send("Provide a playername!")

    const playername = args.shift()
    await rcon.rconCommandAll(`/unban ${playername}`)
    await removeban(playername)
    return message.channel.send(`${playername} was unbanned`)
  }

}

module.exports = Unbanplayer;
