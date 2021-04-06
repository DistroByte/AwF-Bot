const Command = require("../../base/Command");

class ClearQueue extends Command {
  constructor(client) {
    super(client, {
      name: "clearqueue",
      description: "Clears the current queue",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ['cq'],
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

    if (!this.client.player.getQueue(message)) return message.channel.send(`${this.client.emotes?.error} - No music currently playing!`);

    if (this.client.player.getQueue(message).tracks.length <= 1) return message.channel.send(`${this.client.emotes?.error} - There is only one song in the queue.`);

    this.client.player.clearQueue(message);

    message.channel.send(`${this.client.emotes?.success} - The queue has just been **removed**!`);

  }
}

module.exports = ClearQueue;