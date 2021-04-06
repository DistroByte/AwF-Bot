const Command = require("../../base/Command.js"),
  ms = require("ms");

class Slowmode extends Command {

  constructor(client) {
    super(client, {
      name: "slowmode",
      description: "Set a channel cooldown",
      usage: '[#channel] (time)',
      examples: ['{{p}}slowmode #general 10m', '{{p}}slowmode #general'],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["slowmotion"],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const channel = message.mentions.channels.filter((ch) => ch.type === "text" && ch.guild.id === message.guild.id).first();
    if (!channel) {
      return message.channel.send("Please specify a valid channel!");
    }
    const time = args[1];
    if (!time) {
      if (!data.guild.slowmode.channels.find((ch) => ch.id === channel.id)) {
        return message.channel.send("You must enter a valid time! Available units: `s`, `m`, `h` or `d`");
      }
      data.guild.slowmode.channels = data.guild.slowmode.channels.filter((ch) => ch.id !== channel.id);
      data.guild.markModified("slowmode.channels");
      data.guild.save();
      message.channel.send(`**Slow-mode has just been disabled in ${channel.name}!**\n\n:arrow_right_hook: *Send \`${data.guild.prefix}slowmode [#channel] (time)\` to enable it again!*`);
    } else {
      if (isNaN(ms(time))) {
        return message.channel.send("You must enter a valid time! Available units: `s`, `m`, `h` or `d`");
      }
      if (data.guild.slowmode.channels.find((ch) => ch.id === channel.id)) {
        data.guild.slowmode.channels = data.guild.slowmode.channels.filter((ch) => ch.id !== channel.id);
      }
      data.guild.slowmode.channels.push({
        id: channel.id,
        time: ms(time)
      });
      data.guild.markModified("slowmode.channels");
      data.guild.save();
      message.channel.send(`**A slow-mode of \`${this.client.functions.convertTime(message.guild, ms(time))}\` has just been enabled in \`#${channel.name}\`!**\n\n:arrow_right_hook: *Send \`${data.guild.prefix}slowmode ${channel.name}\` to disable it!*`);
    }
  }
}

module.exports = Slowmode;
