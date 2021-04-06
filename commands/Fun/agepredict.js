const Command = require("../../base/Command"),
  { MessageEmbed } = require('discord.js'),
  fetch = require('node-fetch');

class AgePredict extends Command {
  constructor(client) {
    super(client, {
      name: "agepredict",
      description: "Guesses the age of a name",
      usage: "[name]",
      examples: ["{{p}}agepredict John"],
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
    fetch(`https://api.agify.io?name=${args[0]}`)
      .then(res => res.json())
      .then(res => {
        const embed = new MessageEmbed()
          .setTitle(`${res.name} is about **${res.age}** years old`)
          .setColor('GREEN')
        message.channel.send(embed)
      })
  }
}

module.exports = AgePredict;