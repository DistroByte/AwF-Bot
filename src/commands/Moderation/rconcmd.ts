import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";
import FactorioServers from "../../servers";
import rcon from "../../helpers/rcon";

const Rconcmd: Command<Message> = {
  name: "rconcmd",
  description: "Send a RCON command (auto-prefixed with /))",
  usage: "[command]",
  category: "Moderation",
  examples: ["{{p}}rconcmd ban DistroByte", "{{p}}rconcmd /ban DistroByte"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: ["MANAGE_GUILD"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  customPermissions: ["RCON_CMD"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ message, args }) => {
    let toSendServer;
    if (!args[0]) return message.channel.send("No server provided!");
    if (!args[1]) return message.channel.send("No command provided!");
    if (message.mentions.channels.first()) {
      FactorioServers.forEach((server) => {
        if (
          server.path != "" &&
          server.discordid == message.mentions.channels.first().id
        )
          toSendServer = server.discordid;
      });
    } else {
      toSendServer = args[0];
    }

    const cmdArr = args.slice(1);
    const command = cmdArr.join(" ");
    let res = await rcon.rconCommand(command, toSendServer);
    if (typeof res.resp == "object")
      return message.channel.send(
        `Error. Command may have worked, but didn't give a response: ${res.resp}`
      );
    return message.channel.send(`Command worked. Output: \n \`${res.resp}\``);
  },
};
export default Rconcmd;
