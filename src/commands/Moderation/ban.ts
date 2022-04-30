import { Message } from "discord.js";
import { Command } from "../../base/Command.js";
import { addban, checkBan } from "../../helpers/functions";
import rcon from "../../helpers/rcon";

const Getroles: Command<Message> = {
  name: "banplayer",
  description: "Ban a player",
  usage: "[playername] (reason)",
  category: "Moderation",
  examples: [
    "{{p}}banplayer oof2win2",
    "{{p}}banplayer oof2win2 serious hacks",
  ],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: ["BAN_MEMBERS"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  customPermissions: ["MANAGE_SERVER"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ message, args }) => {
    if (!args[0]) return message.channel.send("Provide a playername!");

    const playername = args.shift();
    const reason = args.join(" ");
    console.log(reason);

    const isbanned = await checkBan(playername);
    if (isbanned)
      return message.channel.send(
        `${playername} is already banned for \`${isbanned.reason}!\``
      );

    await rcon.rconCommandAll(`/ban ${playername} ${reason}`);
    await addban(playername, reason);
    return message.channel.send(`${playername} was banned for \`${reason}\``);
  },
};

export default Getroles;
