const Command = require("../../base/Command");

class Search extends Command {
  constructor(client) {
    super(client, {
      name: "search",
      description: "Searches Youtube for your query and offers you some options",
      usage: "[name/url]",
      examples: ["{{p}}search never gonna give you up"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    if (!message.member.voice.channel) return message.channel.send(`${this.client.emotes?.error} - You're not in a voice channel!`);

    if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${this.client.emotes?.error} - You are not in the same voice channel!`);

    if (!args[0]) return message.channel.send(`${this.client.emotes?.error} - Please indicate the title of a song!`);

    this.client.player.play(message, args.join(" "));

  }
}

module.exports = Search;