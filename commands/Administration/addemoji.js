const Command = require("../../base/Command.js");

class Addemoji extends Command {

  constructor(client) {
    super(client, {
      name: "addemoji",
      description: "Add an emoji to the server!",
      usage: "[image-url] [name]",
      examples: ['{{p}}addemoji https://via.placeholder.com/150 test-emoji'],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: true,
      cooldown: 5000
    });
  }

  async run(message, args) {
    const name = args[1] ? args[1].replace(/[^a-z0-9]/gi, "") : null;
    if (!name) {
      return message.channel.send('Please provide an emoji name!');
    }
    if (name.length < 2 || name > 32) {
      return message.channel.send('The length of the emoji name must be between 2 and 32!');
    }

    message.guild.emojis
      .create(URL, name)
      .then(emoji => {
        message.channel.send(`${emoji.name}: added!`);
      })
      .catch(() => {
        message.channel.send(`${name} couldn't be added. Check if your server still has space for new emojis!`);
      });
  }
}

module.exports = Addemoji;