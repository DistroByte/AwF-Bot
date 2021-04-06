const Command = require("../../base/Command.js");

class Addcommand extends Command {

  constructor(client) {
    super(client, {
      name: "addcommand",
      description: 'Add a custom command!',
      usage: ['{{p}}addcommand hello Hello {user}! How are you?'],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["custom-command"],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: true,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    const name = args[0].split("\n")[0];

    if (
      this.client.commands.get(name) ||
      this.client.aliases.get(name) ||
      data.guild.customCommands.find((c) => c.name === name)
    ) {
      return message.channel.send('That command already exists!');
    }

    const answer = (args[0].split("\n")[1] || "") + args.slice(1).join(" ");
    if (!answer) {
      return message.channel.send("Please provide a command answer!");
    }

    data.guild.customCommands.push({
      name: name.toLowerCase(),
      answer: answer
    });
    data.guild.save();

    message.channel.send(`Command **${data.guild.prefix}${name}** added!`);
  }

}

module.exports = Addcommand;
