const Command = require("../../base/Command");

class Volume extends Command {
  constructor(client) {
    super(client, {
      name: "volume",
      description: "Adjusts the volume of the music",
      usage: "[number(1-100)]",
      examples: ["{{p}}volume 100", "{{p}}volume 20"],
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

    if (!args[0] || isNaN(args[0]) || args[0] === 'Infinity') return message.channel.send(`${this.client.emotes?.error} - Please enter a valid number!`);

    if (Math.round(parseInt(args[0])) < 1 || Math.round(parseInt(args[0])) > 100) return message.channel.send(`${this.client.emotes?.error} - Please enter a valid number (between 1 and 100)!`);

    const success = this.client.player.setVolume(message, parseInt(args[0]));

    if (success) message.channel.send(`${this.client.emotes?.success} - Volume set to **${parseInt(args[0])}%**!`);
  }
}

module.exports = Volume;