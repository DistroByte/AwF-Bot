const Command = require("../../base/Command.js");

class Flip extends Command {
  constructor(client) {
    super(client, {
      name: "flip",
      description: "I roll the dice for you!",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["dice"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 1000
    });
  }

  async run(message) {
    const isHeads = Math.random() > 0.5;
    isHeads
      ? message.channel.send("🎲 | Heads!")
      : message.channel.send("🎲 | Tails!");
  }

}

module.exports = Flip;