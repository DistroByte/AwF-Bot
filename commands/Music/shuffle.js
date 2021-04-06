const Command = require("../../base/Command");

class Shuffle extends Command {
  constructor(client) {
    super(client, {
      name: "shuffle",
      description: "Shuffles the current queue",
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

    if (!this.client.player.getQueue(message)) return message.channel.send(`${this.client.emotes?.error} - No music currently playing!`);

    const success = this.client.player.shuffle(message);

    if (success) message.channel.send(`${this.client.emotes?.success} - Queue shuffled **${this.client.player.getQueue(message).tracks.length}** song(s)!`);
  }
}

module.exports = Shuffle;