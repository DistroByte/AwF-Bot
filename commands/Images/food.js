const Command = require("../../base/Command"),
  { MessageEmbed } = require('discord.js'),
  fetch = require('node-fetch');

class Food extends Command {
  constructor(client) {
    super(client, {
      name: "food",
      description: "Fetches a ranom food image",
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
    fetch(`https://foodish-api.herokuapp.com/api`)
      .then(res => res.json())
      .then(res => {
        const embed = new MessageEmbed()
          .setTitle(`Random Meal`)
          .setImage(res.image)
          .setColor('GREEN')
        message.channel.send(embed)
      })
  }
}

module.exports = Food;