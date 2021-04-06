const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Np extends Command {

  constructor(client) {
    super(client, {
      name: "np",
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["nowplaying", "now-playing"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: true,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args, data) {
    if (!message.member.voice.channel) return message.channel.send(`${this.client.emotes?.error} - You're not in a voice channel!`);

    if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${this.client.emotes?.error} - You are not in the same voice channel!`);

    if (!this.client.player.getQueue(message)) return message.channel.send(`${this.client.emotes?.error} - No music currently playing!`);

    const track = this.client.player.nowPlaying(message);
    const filters = [];

    Object.keys(this.client.player.getQueue(message).filters).forEach((filterName) => this.client.player.getQueue(message).filters[filterName]) ? filters.push(filterName) : false;

    message.channel.send({
      embed: {
        color: 'GREEN',
        author: { name: track.title },
        fields: [
          { name: 'Channel', value: track.author, inline: true },
          { name: 'Requested by', value: track.requestedBy.username, inline: true },
          { name: 'From playlist', value: track.fromPlaylist ? 'Yes' : 'No', inline: true },

          { name: 'Views', value: track.views, inline: true },
          { name: 'Duration', value: track.duration, inline: true },
          { name: 'Filters activated', value: filters.length + '/' + this.client.filters.length, inline: true },

          { name: 'Volume', value: this.client.player.getQueue(message).volume, inline: true },
          { name: 'Repeat mode', value: this.client.player.getQueue(message).repeatMode ? 'Yes' : 'No', inline: true },
          { name: 'Currently paused', value: this.client.player.getQueue(message).paused ? 'Yes' : 'No', inline: true },

          { name: 'Progress bar', value: this.client.player.createProgressBar(message, { timecodes: true }), inline: true }
        ],
        thumbnail: { url: track.thumbnail },
        timestamp: new Date(),
      },
    });
  }

}

module.exports = Np;