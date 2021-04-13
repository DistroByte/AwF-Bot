const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");

class Linkme extends Command {
  constructor(client) {
    super(client, {
      name: "getroles",
      description: "Get in-game roles of a user",
      usage: "<UserID/Ping>",
      examples: ["{{p}}getroles @oof2win2#3149", "{{p}}getroles 429696038266208258", "{{p}}getroles"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args) {
    const id = message.mentions.users.first()?.id || args[0] || message.author.id;
    const user = await this.client.findOrCreateUser({ id: id })
    if (user.factorioRoles === [])
      return message.channel.send(`User has no roles!`)
    else message.channel.send(`User has following roles: \`${user.factorioRoles.join('\`, \`')}\``)
  }
}

module.exports = Linkme;