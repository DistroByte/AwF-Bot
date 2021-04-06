const Command = require("../../base/Command");

class Loop extends Command {
  constructor(client) {
    super(client, {
      name: "loop",
      description: "Repeats the currently playing song",
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

    if (args.join(" ").toLowerCase() === 'queue') {
      if (this.client.player.getQueue(message).loopMode) {
        this.client.player.setLoopMode(message, false);
        return message.channel.send(`${this.client.emotes?.success} - Repeat mode **disabled**!`);
      } else {
        this.client.player.setLoopMode(message, true);
        return message.channel.send(`${this.client.emotes?.success} - Repeat mode **enabled** the whole queue will be repeated endlessly!`);
      };
    } else {
      if (this.client.player.getQueue(message).repeatMode) {
        this.client.player.setRepeatMode(message, false);
        return message.channel.send(`${this.client.emotes?.success} - Repeat mode **disabled**!`);
      } else {
        this.client.player.setRepeatMode(message, true);
        return message.channel.send(`${this.client.emotes?.success} - Repeat mode **enabled** the current song will be repeated endlessly!`);
      };
    };
  }
}

module.exports = Loop;