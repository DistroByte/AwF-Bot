import ServerStatistics from "../../base/Serverstatistics";
import rcon from "../../helpers/rcon.js";
import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";

const StatsS: Command<Message> = {
  name: "statss",
  description: "Get statistics of a Factorio server",
  usage: "[channel]",
  category: "Factorio",
  examples: ["{{p}}statss #awf-regular", "{{p}}statss 724696348871622818"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: ["fstatsserver", "factorioserverstatistics", "serverstats"],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ client, message, args }) => {
    const serverid =
      message.mentions.channels.first()?.id ||
      (await client.channels.fetch(args[0]).then((c) => c?.id));
    if (!serverid)
      return message.channel.send(`\`${args[0]}\` is an invalid server!`);

    const stats = await ServerStatistics.findOne({
      serverID: serverid,
    });
    if (!stats)
      return message.channel.send(`\`${args[0]}\` is an invalid server!`);
    const statsembed = new MessageEmbed()
      .setAuthor({
        name: message.guild.name,
        iconURL: message.guild.iconURL(),
      })
      .setColor(client.config.embed.color)
      .setFooter(client.config.embed.footer);
    statsembed.addField("Rockets launched", stats.rocketLaunches.toString());

    // TODO: add in again when the DB wrapper has the option
    // const research = stats.completedResearch?.reduce(
    //   (research, max) => (research.level > max.level ? research : max),
    //   { name: "", level: 0 }
    // );
    // if (research.level)
    //   statsembed.addField(
    //     "Highest research",
    //     `Name: ${research.name}\nLevel: ${research.level}`
    //   );
    // if (stats.completedResearch?.length)
    //   statsembed.addField(
    //     "Total amount of research completed",
    //     stats.completedResearch.length
    //   );
    let evolution = await rcon
      .rconCommand("/evolution", serverid)
      .then((r) => r.resp);
    let time = await rcon.rconCommand("/time", serverid).then((r) => r.resp);
    statsembed.addFields(
      { name: "Evolution", value: evolution },
      { name: "Time", value: time }
    );
    return message.channel.send({
      embeds: [statsembed],
    });
  },
};

export default StatsS;
