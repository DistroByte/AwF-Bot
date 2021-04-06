const Command = require("../../base/Command.js");

class Setprefix extends Command {

  constructor(client) {
    super(client, {
      name: "setprefix",
      description: "Set the server prefix!",
      usage: "[prefix]",
      examples: ['{{p}}setprefix !', '{{p}}setprefix c.'],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const prefix = args[0];
    if (!prefix) {
      return message.channel.send('Please enter a valid prefix!');
    }
    if (prefix.length > 5) {
      return message.channel.send('The prefix shouldn\'t exceed 5 characters!');
    }

    data.guild.prefix = prefix;
    data.guild.save();

    // Sucess
    return message.channel.send(`The bot prefix has been set to \`${prefix}\``);

  }

}

module.exports = Setprefix;