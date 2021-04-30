const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");

class Linkme extends Command {
  constructor(client) {
    super(client, {
      name: "amilinked",
      description: "Check if a user is linked with a Factorio account",
      usage: "(UserID)",
      examples: ["{{p}}amilinked", "{{p}}islinked 429696038266208258"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["islinked"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args) {
    const id = message.mentions.users.first()?.id || args[0] || message.author.id;
    const user = await this.client.findOrCreateUser({id: id})
    if (!user.factorioName)
      return message.channel.send(`User is not linked yet`)
    else message.channel.send(`User is linked with Factorio account \`${user.factorioName}\``)
  }
}

module.exports = Linkme;