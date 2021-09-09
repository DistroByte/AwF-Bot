const Command = require("../../base/Command.js");
const { checkBan } = require("../../helpers/functions")

class Checkban extends Command {
  constructor(client) {
    super(client, {
      name: "checkban",
      description: "Check if a player is banned",
      usage: "[playername]",
      examples: ["{{p}}checkban oof2win2"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000,
    });
  }

  async run(message, args) {
    if (!args[0]) return message.channel.send("Provide a playername!")

    const playername = args.shift()
    const status = await checkBan(playername)
    if (!status) return message.channel.send(`${playername} is currently not banned`)

    return message.channel.send(`${playername} is banned for \`${status.reason}\``)
  }

}

module.exports = Checkban;
