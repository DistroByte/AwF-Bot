import Discord, { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command";

const Stats: Command<Message> = {
  name: "stats",
  description: "Shows the bot stats!",
  category: "General",
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [
    "statistics",
    "infobot",
    "botinfos",
    "bot-infos",
    "bot-info",
    "infos-bot",
    "info-bot",
  ],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: ({ client, message }) => {
    function duration(ms: number) {
      const sec = Math.floor((ms / 1000) % 60).toString();
      const min = Math.floor((ms / (1000 * 60)) % 60).toString();
      const hrs = Math.floor((ms / (1000 * 60 * 60)) % 24).toString();
      const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString();
      const weeks = Math.floor(ms / (1000 * 60 * 60 * 24 * 7)).toString();
      return `${weeks != "0" ? weeks + " weeks," : ""} ${
        days != "0" ? days + " days," : ""
      } ${hrs != "0" ? hrs + " hours," : ""} ${
        min != "0" ? min + " mins," : ""
      } ${sec} secs`;
    }

    const statsEmbed = new MessageEmbed()
      .setColor(client.config.embed.color)
      .setFooter(client.config.embed.footer)
      .setAuthor("Stats")
      .setDescription("ComfyBot is a Discord bot developed by DistroByte#0001")
      .addField(
        "• Statistics",
        `\`Servers: ${client.guilds.cache.size}\`\n\`Users: ${client.users.cache.size}\``,
        true
      )
      .addField(
        "• Using",
        `\`Discord.js : v${Discord.version}\`\n\`Nodejs : v${process.versions.node}\``,
        true
      )
      .addField(
        "• RAM",
        `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\``,
        true
      )
      .addField("• Online", `Online for ${duration(client.uptime)}`);

    statsEmbed.addField(
      "• Links",
      `[Dashboard](https://dashboard.dbyte.xyz) ● [Donate](https://www.patreon.com/distrobyte) ● [Invite](${client.config.inviteURL}) ● [Support](${client.config.supportURL}) ● [Github](https://www.github,com/DistroByte)`
    );
    return message.channel.send({
      embeds: [statsEmbed],
    });
  },
};

export default Stats;
