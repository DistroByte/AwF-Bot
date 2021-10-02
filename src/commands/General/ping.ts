import { Message } from "discord.js";
import { Command } from "../../base/Command.js";

const Ping: Command<void> = {
  name: "ping",
  description: "Show bot's ping",
  category: "General",
  dirname: __dirname,
  enabled: true,
  aliases: ["pong", "latency"],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ message, client }) => {
    message.channel.send(`Pong! My ping is \`...ms\`.`).then((m) => {
      m.edit(
        `Pong! My ping is \`${
          m.createdTimestamp - message.createdTimestamp
        }ms\`. API Latency: \`${Math.round(client.ws.ping)}ms\``
      );
    });
  },
};
export default Ping;
