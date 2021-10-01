const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");
const ServerStatistics = require("../../base/Serverstatistics");
const rcon = require("../../helpers/rcon.js");

class Linkme extends Command {
  constructor(client) {
    super(client, {
      name: "statss",
      description: "Get statistics of a Factorio server",
      usage: "[channel]",
      examples: ["{{p}}statss #awf-regular", "{{p}}statss 724696348871622818"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["fstatsserver", "factorioserverstatistics", "serverstats"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000,
    });
  }

  async run(message, args) {
    const serverid =
      message.mentions.channels.first()?.id ||
      (await this.client.channels.fetch(args[0]).then((c) => c?.id));
    if (!serverid)
      return message.channel.send(`\`${args[0]}\` is an invalid server!`);

    const stats = await ServerStatistics.findOne({
      serverID: serverid,
    });
    if (!stats)
      return message.channel.send(`\`${args[0]}\` is an invalid server!`);
    const statsembed = new MessageEmbed()
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setColor(this.client.config.embed.color)
      .setFooter(this.client.config.embed.footer);
    statsembed.addField("Rockets launched", stats.rocketLaunches);
    const research = stats.completedResearch?.reduce(
      (research, max) => (research.level > max.level ? research : max),
      { name: "", level: 0 }
    );
    if (research.level)
      statsembed.addField(
        "Highest research",
        `Name: ${research.name}\nLevel: ${research.level}`
      );
    if (stats.completedResearch?.length)
      statsembed.addField(
        "Total amount of research completed",
        stats.completedResearch.length
      );
    let evolution = await rcon
      .rconCommand("/evolution", serverid)
      .then((r) => r.resp);
    let time = await rcon.rconCommand("/time", serverid).then((r) => r.resp);
    statsembed.addFields(
      { name: "Evolution", value: evolution },
      { name: "Time", value: time }
    );
    message.channel.send(statsembed);
  }
}

module.exports = Linkme;
