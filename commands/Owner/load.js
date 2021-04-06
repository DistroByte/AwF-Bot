const Command = require("../../base/Command");

class Load extends Command {
  constructor(client) {
    super(client, {
      name: "load",
      description: "Loads a command",
      usage: "[command]",
      examples: ["{{p}}load help"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: true,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    const command = args[0];
    const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
    if (!cmd) {
      message.channel.send(`${command} is not an available command`)
    }
    await this.client.loadCommand(cmd.conf.location, cmd.help.name);
    message.channel.send(`${cmd.help.name} successfully loaded!`)
  }
}

module.exports = Load;