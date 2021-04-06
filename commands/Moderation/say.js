const Command = require("../../base/Command");

class Say extends Command {
  constructor(client) {
    super(client, {
      name: "say",
      description: "Sends a message from the bot",
      usage: "(#channel) [message]",
      examples: ["{{p}}say Hello there", "{{p}}say #general Hello there"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: true,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    let argsresult;
    let mentionedChannel = message.mentions.channels.first();

    message.delete();
    if (mentionedChannel) {
      argsresult = args.slice(1).join(' ');
      mentionedChannel.send(argsresult);
    } else {
      argsresult = args.join(' ');
      message.channel.send(argsresult);
    }
  }
}

module.exports = Say;