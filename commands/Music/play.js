const Command = require("../../base/Command.js");

class Play extends Command {

  constructor(client) {
    super(client, {
      name: "play",
      description: "Plays music for you! Works with Spotify links for both songs and playlists",
      usage: "[song]",
      examples: ["{{p}}play Despacito"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["p"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: true,
      cooldown: 5000
    });
  }

  async run(message, args) {
    if (!message.member.voice.channel) return message.channel.send(`${this.client.emotes?.error} - You're not in a voice channel!`);
    if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${this.client.emotes?.error} - You are not in the same voice channel!`);

    await this.client.player.play(message, args.join(" "), { firstResult: true });
  }

}

module.exports = Play;