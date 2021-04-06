const Command = require("../../base/Command");

class CurrentPlayers extends Command {
  constructor(client) {
    super(client, {
      name: "currentplayers",
      description: "Shows the current number of music players",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    message.channel.send(`${this.client.emotes?.success} - ${this.client.user.username} connected in **${this.client.voice.connections.size}** channels!`);
  }
}

module.exports = CurrentPlayers;