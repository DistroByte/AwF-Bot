const Command = require("../../base/Command"),
  { MessageEmbed } = require('discord.js'),
  fetch = require('node-fetch');

class Cat extends Command {
  constructor(client) {
    super(client, {
      name: "cat",
      description: "Fetches a random cat image",
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
    fetch('https://aws.random.cat/meow')
      .then(res => res.json())
      .then(res => {
        const embed = new MessageEmbed()
          .setTitle('Random Cat')
          .setImage(res.file)
          .setColor('GREEN')
        message.channel.send(embed)
      })
  }
}

module.exports = Cat;