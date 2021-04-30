const Command = require("../../base/Command");

class Shutdown extends Command {
  constructor(client) {
    super(client, {
      name: "shutdown",
      description: "Shuts down the bot!",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ['restart'],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: true,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    try {
      await message.react('👋');
      process.exit();
    } catch (e) {
      message.channel.send(`ERROR: ${e.message}`);
    }
  }
}

module.exports = Shutdown;