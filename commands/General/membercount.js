const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command");

class MemberCount extends Command {
  constructor(client) {
    super(client, {
      name: "membercount",
      description: "Gets the current member count of the guid!",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false
    });
  }

  async run(message, args, data) {
    message.channel.send(new MessageEmbed()
      .setColor(data.config.embed.color)
      .setThumbnail(message.guild.iconURL)
      .setAuthor(`${message.guild.name} Info`, message.guild.iconURL)
      .addField('**Member Count:**', `${message.guild.memberCount}`, true)
      .setFooter(data.config.embed.footer))
  }
}

module.exports = MemberCount;