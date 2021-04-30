const Command = require('../../base/Command.js');

class Ping extends Command {

  constructor(client) {
    super(client, {
      name: 'ping',
      description: "Show bot's ping",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ['pong', 'latency'],
      memberPermissions: [],
      botPermissions: ['SEND_MESSAGES'],
      nsfw: false,
      ownerOnly: false,
      cooldown: 1000
    });
  }

  async run(message) {
    message.channel.send(`Pong! My ping is \`...ms\`.`).then((m) => {
      m.edit(`Pong! My ping is \`${m.createdTimestamp - message.createdTimestamp}ms\`. API Latency: \`${Math.round(this.client.ws.ping)}ms\``);
    });
  }

}

module.exports = Ping;