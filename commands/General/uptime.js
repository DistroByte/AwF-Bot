const Command = require("../../base/Command");

class Uptime extends Command {
  constructor(client) {
    super(client, {
      name: "uptime",
      description: "Shows the bot's uptime",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false
    });
  }

  async run(message, args, data) {
    function duration(ms) {
      const sec = Math.floor((ms / 1000) % 60).toString();
      const min = Math.floor((ms / (1000 * 60)) % 60).toString();
      const hrs = Math.floor((ms / (1000 * 60 * 60)) % 24).toString();
      const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString();
      const weeks = Math.floor((ms / (1000 * 60 * 60 * 24 * 7))).toString();
      return `${weeks != 0 ? weeks + " weeks," : ""} ${days != 0 ? days + " days," : ""} ${hrs != 0 ? hrs + " hours," : ""} ${min != 0 ? min + " mins," : ""} ${sec} secs`;
    }

    message.channel.send(`I have been online for \`${duration(this.client.uptime).trim()}\``)
  }
}

module.exports = Uptime;