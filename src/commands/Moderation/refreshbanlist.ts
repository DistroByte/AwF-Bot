import { Message } from "discord.js";
import { Command } from "../../base/Command.js";
import migratebans from "../../helpers/migratebans";

const Refreshbanlist: Command<Message> = {
  name: "refreshbanlist",
  description: "Refresh banlist from banlist-full.json file",
  category: "Moderation",
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: ["MANAGE_GUILD"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  customPermissions: ["MANAGE_SERVER"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ message }) => {
    await migratebans();
    return message.channel.send("Bans have been migrated.");
  },
};
export default Refreshbanlist;
