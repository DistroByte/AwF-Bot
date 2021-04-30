const Command = require("../../base/Command.js");

class Reload extends Command {

  constructor(client) {
    super(client, {
      name: "reload",
      description: "Reload a command!",
      usage: "[command]",
      examples: ["{{p}}reload help"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: [],
      nsfw: false,
      ownerOnly: true,
      cooldown: 3000
    });
  }

  async run(message, args) {
    const command = args[0];
    const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
    if (!cmd) {
      message.channel.send(`${command} is not an available command`)
    }
    await this.client.unloadCommand(cmd.conf.location, cmd.help.name);
    await this.client.loadCommand(cmd.conf.location, cmd.help.name);
    message.channel.send(`${cmd.help.name} successfully reloaded!`)
  }

}

module.exports = Reload;