const Command = require("../../base/Command");

class Ask extends Command {
  constructor(client) {
    super(client, {
      name: "ask",
      description: "Don't ask to ask, just ask!",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false
    });
  }

  async run(message, args, data) {
    message.channel.send('Don\'t ask to ask, just ask!')
    message.channel.send('https://cdn.discordapp.com/attachments/762797129626288129/770619652127719464/ask.png')
  }
}

module.exports = Ask;