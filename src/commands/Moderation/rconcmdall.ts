import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";
import rcon from "../../helpers/rcon";

const RconcmdAll: Command<Message> = {
  name: "rconcmdall",
  description: "Send a RCON command to all servers (auto-prefixed with /)",
  usage: "[command]",
  category: "Moderation",
  examples: [
    "{{p}}rconcmdall ban DistroByte",
    "{{p}}rconcmdall /ban DistroByte",
  ],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: ["MANAGE_GUILD"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  customPermissions: ["RCON_CMD"],
  run: async ({ client, message, args }) => {
    let outEmbed = new MessageEmbed()
      .setTitle(`RCON Output`)
      .setDescription(`Output of RCON command to all servers`)
      .setColor("GREEN")
      .setAuthor(
        `${message.guild.me.displayName} Help`,
        message.guild.iconURL()
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter(
        `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
        client.user.displayAvatarURL()
      );
    const command = args.join(" ");
    const res = await rcon.rconCommandAll(command);
    res.forEach((out) => {
      try {
        if (out.resp && out.resp.length > 1024)
          throw Error("Response too long!");
        else
          outEmbed.addField(
            `${out.resp != false ? out.server.discordname : out.identifier}`,
            out.resp.toString()
          );
      } catch (error) {
        outEmbed.addField(
          `${out.resp != false ? out.server.discordname : out.identifier}`,
          error
        );
        console.error(error);
      }
    });
    return message.channel.send({
      embeds: [outEmbed],
    });
  },
};
export default RconcmdAll;
