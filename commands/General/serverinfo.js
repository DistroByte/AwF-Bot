const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command");

class ServerInfo extends Command {
  constructor(client) {
    super(client, {
      name: "serverinfo",
      description: "Gets a server's information",
      usage: "[ID/Name]",
      examples: ["{{p}}serverinfo ComfyBot", "{{p}}serverinfo"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ['si'],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false
    });
  }

  async run(message, args, data) {
    let guild = message.guild;

    if (args[0]) {
      let found = this.client.guilds.cache.get(args[0]);
      if (!found) {
        found = this.client.cache.guilds.find((g) => g.name === args.join(" "));
        if (found) {
          guild = found;
        }
      }
    }

    guild = await guild.fetch();

    const embed = new MessageEmbed()
      .setAuthor(guild.name, guild.iconURL({ dynamic: true }))
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addField("Name", guild.name, true)
      .addField("Created", this.client.printDate(guild.createdAt), true)
      .addField("Members", `${guild.members.cache.filter(m => !m.user.bot).size} members | ${guild.members.cache.filter(m => m.user.bot).size} bots`, true)
      .addField("AFK Channel", guild.afkChannel || "No AFK channel", true)
      .addField("ID", guild.id, true)
      .addField("Owner", guild.owner, true)
      .addField("Boosts count", guild.premiumSubscriptionCount || 0, true)
      .addField("Channels", `${guild.channels.cache.filter(c => c.type === "text").size} text | ${guild.channels.cache.filter(c => c.type === "voice").size} voice | ${guild.channels.cache.filter(c => c.type === "category").size} categories`, true)
      .setColor(data.config.embed.color)
      .setFooter(data.config.embed.footer);

    message.channel.send(embed);
  }
}

module.exports = ServerInfo;