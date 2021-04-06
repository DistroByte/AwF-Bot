const Command = require("../../base/Command.js");

class Delcommand extends Command {

  constructor(client) {
    super(client, {
      name: "delcommand",
      description: 'Remove a custom command!',
      usage: ['{{p}}delcommand hello'],
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

    const name = args[0];
    if (!name) {
      return message.channel.send("Please enter a valid custom command name!")
    }

    if (!data.guild.customCommands.find((c) => c.name === name)) {
      return message.channel.send(`The command ${name} doesn't exist!`);
    }

    data.guild.customCommands = data.guild.customCommands.filter((c) => c.name !== name);
    data.guild.save();

    message.channel.send(`The ${name} command has been removed from the server!`);
  }

}

module.exports = Delcommand;