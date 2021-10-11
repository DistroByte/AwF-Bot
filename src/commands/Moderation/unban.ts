import { Message } from "discord.js";
import { removeban } from "../../helpers/functions.js";
import { Command } from "../../base/Command.js";
import rcon from "../../helpers/rcon";

const Unban: Command<Message> = {
  name: "unbanplayer",
  description: "Unban a player",
  usage: "[playername]",
  category: "Moderation",
  aliases: ["unban"],
  examples: ["{{p}}unbanplayer oof2win2"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  memberPermissions: ["BAN_MEMBERS"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ client, message, args }) => {
    if (!args[0]) return message.channel.send("Provide a playername!");

    const playername = args.shift();
    await rcon.rconCommandAll(`/unban ${playername}`);
    await removeban(playername);
    return message.channel.send(`${playername} was unbanned`);
  },
};
export default Unban;
