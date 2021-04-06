const Command = require("../../base/Command");

class Superscripts extends Command {
  constructor(client) {
    super(client, {
      name: "superscript",
      description: "Makes a string superscript!",
      usage: "[text]",
      examples: ["{{p}}superscript I am small text!"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["ss"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false
    });
  }

  async run(message, args, data) {
    var raise = require('superscript-text');
    message.channel.send(raise(args.join(" ")));
  }
}

module.exports = Superscripts;