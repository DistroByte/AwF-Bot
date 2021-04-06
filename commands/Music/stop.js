const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Stop extends Command {

  constructor(client) {
    super(client, {
      name: "stop",
      description: "Stops the music!",
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["leave"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args, data) {
    if (!message.member.voice.channel) return message.channel.send(`${this.client.emotes?.error} - You're not in a voice channel!`);

    if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${this.client.emotes?.error} - You are not in the same voice channel!`);

    if (!this.client.player.getQueue(message)) return message.channel.send(`${this.client.emotes?.error} - No music currently playing!`);

    this.client.player.setRepeatMode(message, false);
    const success = this.client.player.stop(message);

    if (success) message.channel.send(`${this.client.emotes?.success} - Music **stopped**!`);
  }

}

module.exports = Stop;
