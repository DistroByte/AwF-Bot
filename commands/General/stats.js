const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Stats extends Command {

  constructor(client) {
    super(client, {
      name: "stats",
      description: "Shows the bot stats!",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["statistics", "infobot", "botinfos", "bot-infos", "bot-info", "infos-bot", "info-bot"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const statsEmbed = new Discord.MessageEmbed()
      .setColor(data.config.embed.color)
      .setFooter(data.config.embed.footer)
      .setAuthor("Stats")
      .setDescription("ComfyBot is a Discord bot developed by DistroByte#0001")
      .addField("• Statistics", `\`Servers: ${this.client.guilds.cache.size}\`\n\`Users: ${this.client.users.cache.size}\``, true)
      .addField("• Using", `\`Discord.js : v${Discord.version}\`\n\`Nodejs : v${process.versions.node}\``, true)
      .addField("• RAM", `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\``, true)
      .addField("• Online", `Online for ${this.client.convertTime(Date.now() + this.client.uptime, "from", true)}`)
      .addField("• Music", `Playing music on \`${this.client.voice.connections.size}\` servers`)
    // .addField(":heart: • Acknowledgements & credits", "");

    statsEmbed.addField("• Links", `[Dashboard](https://dashboard.dbyte.xyz) ● [Donate](https://www.patreon.com/distrobyte) ● [Invite](${this.client.config.inviteURL}) ● [Support](${this.client.config.supportURL}) ● [Github](https://www.github,com/DistroByte)`);
    message.channel.send(statsEmbed);
  }
}

module.exports = Stats;
