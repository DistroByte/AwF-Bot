import Discord, { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command";

const Stats: Command<Message> = {
  name: "uptime",
  description: "Shows the bot uptime",
  category: "General",
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES"],
  nsfw: false,
  ownerOnly: false,
  run: ({ client, message }) => {
    function duration(ms: number) {
      const sec = Math.floor((ms / 1000) % 60).toString();
      const min = Math.floor((ms / (1000 * 60)) % 60).toString();
      const hrs = Math.floor((ms / (1000 * 60 * 60)) % 24).toString();
      const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString();
      const weeks = Math.floor(ms / (1000 * 60 * 60 * 24 * 7)).toString();
      return `${weeks != "0" ? weeks + " weeks, " : ""}${
        days != "0" ? days + " days, " : ""
      }${hrs != "0" ? hrs + " hours, " : ""}${
        min != "0" ? min + " minutes, " : ""
      }${sec} seconds`;
    }
    return message.channel.send(
      `I have been online for ${duration(client.uptime)}`
    );
  },
};

export default Stats;
