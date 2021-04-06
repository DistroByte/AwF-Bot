const Command = require("../../base/Command"),
  { MessageEmbed } = require('discord.js'),
  fetch = require('node-fetch');

class Space extends Command {
  constructor(client) {
    super(client, {
      name: "space",
      description: "Lists the people in space right now",
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
    var url = "http://api.open-notify.org/astros.json";

    const embed = new MessageEmbed()
      .setTitle("**List of people currently in space**")

    fetch(url)
      .then(res => res.json())
      .then(res => {
        embed
          .setDescription(`Total number of people in space: **${res.number}**`)
        let data = []
        res.people.forEach(m => {
          data.push(`${m.craft} - ${m.name}`)
        })
        embed
          .addField(`Name`, data)
        message.channel.send(embed)
      })
  }
}

module.exports = Space;