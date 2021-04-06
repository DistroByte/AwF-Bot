const Command = require("../../base/Command.js"),
  Resolvers = require("../../helpers/resolvers");

class Setmodlogs extends Command {

  constructor(client) {
    super(client, {
      name: "setmodlogs",
      description: "Set the moderation logs channel!",
      usage: "(#channel)",
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["setmodlogs"],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const areModLogsEnabled = Boolean(data.guild.plugins.modlogs);
    const sentChannel = await Resolvers.resolveChannel({
      message,
      search: args.join(" "),
      channelType: "text"
    });

    if (!sentChannel && areModLogsEnabled) {
      data.guild.plugins.modlogs = null;
      data.guild.markModified("plugins.modlogs");
      await data.guild.save();
      return message.channel.send('Moderation logs channel deleted!');
    } else {
      const channel = sentChannel || message.channel;
      data.guild.plugins.modlogs = channel.id;
      data.guild.markModified("plugins.modlogs");
      await data.guild.save();
      return message.channel.send(`Moderation logs will be sent in **${channel.toString()}**!`);
    }
  }

}

module.exports = Setmodlogs;