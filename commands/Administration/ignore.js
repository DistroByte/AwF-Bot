const Command = require("../../base/Command.js");

class Ignore extends Command {

  constructor(client) {
    super(client, {
      name: "ignore",
      description: "Toggle commands in a channel",
      usage: '[channel]',
      examples: ['{{p}}ignore #channel'],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["disableChannel"],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    const channel = message.mentions.channels.filter((ch) => ch.type === "text" && ch.guild.id === message.guild.id).first() || message.channel;
    if (!channel) {
      return message.channel.send('Please specify a valid channel!');
    }

    const ignored = data.guild.ignoredChannels.includes(channel.id);

    if (ignored) {
      data.guild.ignoredChannels = data.guild.ignoredChannels.filter((ch) => ch !== channel.id);
      data.guild.save();
      return message.channel.send(`Commands are now enabled in ${channel.toString()}!`);
    } else if (!ignored) {
      data.guild.ignoredChannels.push(channel.id);
      data.guild.save();
      return message.channel.send(`Commands are now disabled in ${channel.toString()}!`);
    }
  }
}

module.exports = Ignore;