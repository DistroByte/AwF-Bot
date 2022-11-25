import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";

const Getroles: Command<Message> = {
  name: "getroles",
  description: "Get in-game roles of a user",
  usage: "(UserID/Ping)",
  category: "Factorio",
  examples: [
    "{{p}}getroles @oof2win2#3149",
    "{{p}}getroles 429696038266208258",
    "{{p}}getroles",
  ],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ client, message, args }) => {
    const id =
      message.mentions.users.first()?.id || args[0] || message.author.id;
    const user = await client.findOrCreateUser({ id: id });
    if (user.factorioRoles.length === 0)
      return message.channel.send(`User has no roles!`);
    else
      message.channel.send(
        `User has following roles: \`${user.factorioRoles.join("`, `")}\``
      );
  },
};

export default Getroles;
