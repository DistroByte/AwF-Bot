import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";

const Getroles: Command<Message> = {
  name: "amilinked",
  description: "Check if a user is linked with a Factorio account",
  usage: "(UserID)",
  category: "Factorio",
  examples: ["{{p}}amilinked", "{{p}}islinked 429696038266208258"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: ["islinked"],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ client, message, args }) => {
    const id =
      message.mentions.users.first()?.id || args[0] || message.author.id;
    const user = await client.findOrCreateUser({ id: id });
    if (!user.factorioName)
      return message.channel.send(`User is not linked yet`);
    else
      message.channel.send(
        `User is linked with Factorio account \`${user.factorioName}\``
      );
  },
};

export default Getroles;
