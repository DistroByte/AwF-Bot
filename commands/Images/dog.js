const Command = require("../../base/Command"),
  { MessageEmbed } = require('discord.js'),
  fetch = require('node-fetch');

class Dog extends Command {
  constructor(client) {
    super(client, {
      name: "dog",
      description: "Fetches a random dog image",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    fetch('https://random.dog/woof.json')
      .then(res => res.json())
      .then(res => {
        const embed = new MessageEmbed()
          .setTitle('Random Dog')
          .setImage(res.url)
          .setColor('GREEN')
        message.channel.send(embed)
      })
  }
}

module.exports = Dog;