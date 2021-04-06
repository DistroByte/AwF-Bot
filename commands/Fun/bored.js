const Command = require("../../base/Command"),
  { MessageEmbed } = require('discord.js'),
  fetch = require('node-fetch');

class Bored extends Command {
  constructor(client) {
    super(client, {
      name: "bored",
      description: "Gets an activity for you to do if you're bored!",
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
    fetch(`https://www.boredapi.com/api/activity`)
      .then(res => res.json())
      .then(res => {
        const embed = new MessageEmbed()
          .setTitle(`The Bored API says you should do...`)
          .setDescription(`**${res.activity}**`)
          .addField(`Type`, `${res.type}`)
          .setColor('GREEN')
        message.channel.send(embed)
      })
  }
}

module.exports = Bored;