const Command = require("../../base/Command.js");
const migratebans = require("../../helpers/migratebans")

class Refreshbanlist extends Command {
  constructor(client) {
    super(client, {
      name: "refreshbanlist",
      description: "Refresh banlist from banlist-full.json file",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
			cooldown: 5000,
    });
  }

  async run(message) {
    await migratebans()
    return message.channel.send("Bans have been migrated.")
  }

}

module.exports = Refreshbanlist;
