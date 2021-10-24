import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";

const Shutdown: Command<Message> = {
  name: "shutdown",
  description: "Shuts down the bot!",
  category: "Owner",
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: ["restart"],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: true,
  run: async ({ client, message, args }) => {
    try {
      await message.react("👋");
      process.exit();
    } catch (e) {
      return message.channel.send(`ERROR: ${e.message}`);
    }
  },
};

export default Shutdown;
