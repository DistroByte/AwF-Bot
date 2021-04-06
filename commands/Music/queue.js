const Command = require("../../base/Command");

class Queue extends Command {
  constructor(client) {
    super(client, {
      name: "queue",
      description: "Gets your current queue",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ['q'],
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

    const queue = this.client.player.getQueue(message);

    if (!this.client.player.getQueue(message)) return message.channel.send(`${this.client.emotes?.error} - No songs currently playing!`);

    message.channel.send(`**Server queue - ${message.guild.name} ${this.client.emotes?.queue} ${this.client.player.getQueue(message).loopMode ? '(looped)' : ''}**\nCurrent: ${queue.playing.title} | ${queue.playing.author}\n\n` + (queue.tracks.map((track, i) => {
      return `**#${i + 1}** - ${track.title} | ${track.author} (requested by: ${track.requestedBy.username})`
    }).slice(0, 5).join('\n') + `\n\n${queue.tracks.length > 5 ? `And **${queue.tracks.length - 5}** other songs` : `**${queue.tracks.length}** song(s) in the playlist`}`));

  }
}

module.exports = Queue;