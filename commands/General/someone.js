const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Someone extends Command {

  constructor(client) {
    super(client, {
      name: "someone",
      description: "Pick a random member on the server!",
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["somebody", "something"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 500
    });
  }

  async run(message, args, data) {

    const member = message.guild.members.cache.random(1)[0];

    const embed = new Discord.MessageEmbed()
      .addField("Username", member.user.username, true)
      .addField("Discriminator", "#" + member.user.discriminator, true)
      .addField("ID", member.user.id)
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(data.config.embed.color);
    message.channel.send(embed);

  }

}

module.exports = Someone;