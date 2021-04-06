const Command = require("../../base/Command.js");

class Setafk extends Command {

  constructor(client) {
    super(client, {
      name: "setafk",
      description: "Become AFK (members who mention you will receive a message)",
      usage: "[reason]",
      examples: ['{{prefix}}setafk I\'m eating :)'],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["afk"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false
    });
  }

  async run(message, args, data) {

    const reason = args.join(" ");
    if (!reason) {
      return message.channel.send('Please specify the reason for your AFK status!');
    }

    // Send success message
    message.channel.send(`You're now AFK (reason: ${reason})`);

    data.userData.afk = reason;
    data.userData.save();
  }
}

module.exports = Setafk;