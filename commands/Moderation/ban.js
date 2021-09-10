const Command = require("../../base/Command.js");
const {addban, checkBan} = require("../../helpers/functions")
const rcon = require("../../helpers/rcon")

class BanPlayer extends Command {
  constructor(client) {
    super(client, {
      name: "banplayer",
      description: "Ban a player",
      usage: "[playername] (reason)",
      examples: ["{{p}}banplayer oof2win2", "{{p}}banplayer oof2win2 serious hacks"],
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
    const reason = args.join(" ")

    const isbanned = await checkBan(playername)
    if (isbanned) return message.channel.send(`${playername} is already banned for \`${isbanned.reason}!\``)

    await rcon.rconCommandAll(`/ban ${playername} ${reason}`)
    await addban(playername, reason)
    return message.channel.send(`${playername} was banned for \`${reason}\``)
  }

}

module.exports = BanPlayer;
