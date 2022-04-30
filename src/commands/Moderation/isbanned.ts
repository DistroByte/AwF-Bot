import { Message } from "discord.js";
import { Command } from "../../base/Command.js";
import { checkBan } from "../../helpers/functions";

const Getroles: Command<Message> = {
  name: "checkban",
  description: "Check if a player is banned",
  usage: "[playername]",
  category: "Moderation",
  examples: ["{{p}}checkban oof2win2"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  customPermissions: ["MANAGE_SERVER"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ message, args }) => {
    if (!args[0]) return message.channel.send("Provide a playername!");

    const playername = args.shift();
    const status = await checkBan(playername);
    if (status == false)
      return message.channel.send(`${playername} is currently not banned`);

    return message.channel.send(
      `${playername} is banned for \`${status.reason}\``
    );
  },
};

export default Getroles;
