import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";

const Getroles: Command<Message> = {
  name: "islinkedfactorio",
  description: "Check if a player is linked to Discord",
  usage: "(Playername)",
  category: "Factorio",
  examples: ["{{p}}islinkedfactorio oof2win2"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ client, message, args }) => {
    if (!args[0]) return message.channel.send("No name provided!");
    const user = await client.findUserFactorioName(args[0]);
    if (!user)
      return message.channel.send("No user is linked to this playername");
    else
      message.channel.send(
        `User is linked with Discord account \`${await client.users
          .fetch(user.id)
          .then((user) => user.tag)}\``
      );
  },
};

export default Getroles;
