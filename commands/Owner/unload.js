const Command = require("../../base/Command");

class Unload extends Command {
  constructor(client) {
    super(client, {
      name: "unload",
      description: "Unloads a command",
      usage: "[command]",
      examples: ["{{p}}unload help"],
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
    await this.client.unloadCommand(cmd.conf.location, cmd.help.name);
    message.channel.send(`${cmd.help.name} successfully unloaded!`)
  }
}

module.exports = Unload;