import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";
import mongoose from "mongoose";

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
    if (!user.factorioName)
      return message.reply(`User <@${userID}> is not linked to Factorio!`);

    const data = await mongoose.connections[1]
      .getClient()
      .db("scenario")
      .collection("PlayerData")
      .findOne({
        playername: user.factorioName,
      });

    console.log(data.data);
    if (!data.data || !data.data.Statistics)
      return message.reply(`User <@${userID}> has no stats!`);
    const { Statistics } = data.data;

    let embed = new MessageEmbed()
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
      .setColor(client.config.embed.color)
      .setFooter(client.config.embed.footer);
    embed.setTitle("Global Factorio User Statistics");
    embed.setDescription(`Statistics of <@${userID}> | ${userID}`);
    embed.addFields([
      {
        name: "Damage dealt",
        value: (Statistics.DamageDealt ?? 0).toString(),
      },
      { name: "Deaths", value: (Statistics.Deaths ?? 0).toString() },
      {
        name: "Built Entities",
        value: (Statistics.MachinesBuilt ?? 0).toString(),
      },
      {
        name: "Time played (minutes)",
        value: (Statistics.Playtime ?? 0).toString(),
      },
    ]);
    return message.channel.send({
      embeds: [embed],
    });
  },
};

export default StatsG;
