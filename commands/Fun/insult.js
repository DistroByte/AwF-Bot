const Command = require("../../base/Command"),
  { MessageEmbed } = require('discord.js'),
  fetch = require('node-fetch');

class Insult extends Command {
  constructor(client) {
    super(client, {
      name: "insult",
      description: "Insults a user",
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
    fetch(`https://evilinsult.com/generate_insult.php?lang=en&type=json`)
      .then(res => res.json())
      .then(res => {
        message.channel.send(`${args ? message.channel.mentions.first() : message.author} ${res.insult.toString()}`)
      })
  }
}

module.exports = Insult;