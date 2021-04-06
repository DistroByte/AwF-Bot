const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");
const rcon = require("../../helpers/rcon")

class Eightball extends Command {
  constructor(client) {
    super(client, {
      name: "onlineplayers",
      description: "I'm telling you the truth!",
      usage: "",
      examples: ["{{p}}onlineplayers"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["po", "playersomline"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 10000
    });
  }

  async run(message, args) {
    let res = await rcon.rconCommandAll('/p o')
    let embed = new MessageEmbed()
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setColor(this.client.config.embed.color)
      .setFooter(this.client.config.embed.footer);
    res.forEach((response) => {
      if (response[0].length > 1024) embed.addField(response[1].discordname, "Response Too Long")
      else embed.addField(response[1].discordname, response[0])
    })
    message.channel.send(embed)
  }

}

module.exports = Eightball;