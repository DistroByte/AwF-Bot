const Command = require("../../base/Command.js");

class Automod extends Command {

  constructor(client) {
    super(client, {
      name: "automod",
      description: "Toggle Discord invites automatic deletion",
      usage: "[on/off] (#channel)",
      examples: ['{{p}}automod on', '{{p}}automod off #general', '{{p}}automod off'],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: true,
      cooldown: 5000
    });
  }

  async run(message, args, data) {
    const status = args[0];
    if (!status || (status !== "on" && status !== "off")) {
      return message.channel.send('Please enter a valid value between `on` and `off`');
    }

    if (status === "on") {
      data.guild.plugins.automod = { enabled: true, ignored: [] };
      data.guild.markModified("plugins.automod");
      data.guild.save();
      message.success(`**Discord invites will now be automatically deleted!**\n\n:arrow_right_hook: *Send \`${data.guild.prefix}automod off #channel\` to ignore a channel!*`);
    } else if (status === "off") {
      if (message.mentions.channels.filter((ch) => ch.type === "text" && ch.guild.id === message.guild.id).first()) {
        const channel = message.mentions.channels.first();
        data.guild.plugins.automod.ignored.push(channel);
        data.guild.markModified("plugins.automod");
        data.guild.save();
        message.channel.send(`Auto-moderation will no longer be performed in ${channel.toString()}!`);
      } else {
        data.guild.plugins.automod = { enabled: false, ignored: [] };
        data.guild.markModified("plugins.automod");
        data.guild.save();
        message.channel.send('Auto moderation is no longer enabled on this server!');
      }
    }
  }

}

module.exports = Automod;