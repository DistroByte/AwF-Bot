const Command = require("../../base/Command");

class Resume extends Command {
  constructor(client) {
    super(client, {
      name: "resume",
      description: "Resumes after pausing the music!",
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

    if (!this.client.player.getQueue(message).paused) return message.channel.send(`${this.client.emotes?.error} - The music is already playing!`);

    const success = this.client.player.resume(message);

    if (success) message.channel.send(`${this.client.emotes?.success} - Song ${this.client.player.getQueue(message).playing.title} resumed!`);

  }
}

module.exports = Resume;