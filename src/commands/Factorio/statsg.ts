import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";

const StatsG: Command<Message> = {
  name: "statsg",
  description: "Get global Factorio stats of a user",
  usage: "[@Ping]",
  category: "Factorio",
  examples: ["{{p}}statsg <@429696038266208258>"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ client, message, args }) => {
    let userID = message.mentions.users.first()?.id || args[0];
    if (!userID) return message.reply("No user ping provided!");

    if (!client.users.cache.get(userID))
      return message.reply(`User <@${userID}> doesn't exist!`);
    let user = await client.findOrCreateUser({ id: userID });
    if (!user.factorioName) return message.reply("User is not linked!");

    let embed = new MessageEmbed()
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setColor(client.config.embed.color)
      .setFooter(client.config.embed.footer);
    embed.setTitle("Global Factorio User Statistics");
    embed.setDescription(`Statistics of <@${userID}> | ${userID}`);
    embed.addFields(
      { name: "Total Points", value: user.factorioStats.points },
      { name: "Deaths", value: user.factorioStats.deaths },
      { name: "Built Entities", value: user.factorioStats.builtEntities },
      {
        name: "Time played (minutes)",
        value: (user.factorioStats.timePlayed / 54000) * 15,
      }
    );
    return message.channel.send(embed);
  },
};

export default StatsG;
