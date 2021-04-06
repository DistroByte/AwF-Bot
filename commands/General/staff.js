const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Staff extends Command {

  constructor(client) {
    super(client, {
      name: "staff",
      description: "Shows the server staff members list!",
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["stafflist", "staffliste"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    const guild = await message.guild.fetch();
    const administrators = guild.members.cache.filter((m) => m.hasPermission("ADMINISTRATOR") && !m.user.bot);
    const moderators = guild.members.cache.filter((m) => !administrators.has(m.id) && m.hasPermission("MANAGE_MESSAGES") && !m.user.bot);
    const embed = new Discord.MessageEmbed()
      .setAuthor(`${message.guild.name} staff members`)
      .addField("Administrators", (administrators.size > 0 ? administrators.map((a) => `${this.client.emotes?.status[a.presence.status]} | ${a.user.tag}`).join("\n") : "No administrators"))
      .addField("Moderators", (moderators.size > 0 ? moderators.map((m) => `${this.client.emotes?.status[m.presence.status]} | ${m.user.tag}`).join("\n") : "No moderators"))
      .setColor(data.config.embed.color)
      .setFooter(data.config.embed.footer);
    message.channel.send(embed);
  }
}

module.exports = Staff;