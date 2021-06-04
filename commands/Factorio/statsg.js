const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");
const serverJS = require("../../servers")
const rcon = require("../../helpers/rcon")

class Linkme extends Command {
  constructor(client) {
    super(client, {
      name: "statsg",
      description: "Get global Factorio stats of a user",
      usage: "[@Ping]",
      examples: ["{{p}}statsg <@429696038266208258>"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000,
    });
  }

  async run(message, args) {
    let userID = message.mentions.users.first()?.id || args[0]
    if (!userID) return message.reply("No user ping provided!")
    if (!this.client.users.cache.get(userID)) return message.reply(`User <@${userID}> doesn't exist!`)
    let user = await this.client.findOrCreateUser({id: userID})
    if (!user.factorioName) return message.reply("User is not linked!")

    let embed = new MessageEmbed()
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setColor(this.client.config.embed.color)
      .setFooter(this.client.config.embed.footer);
    embed.setTitle("Global Factorio User Statistics")
    embed.setDescription(`Statistics of <@${userID}> | ${userID}`)
    embed.addFields(
      {name: "Total Points", value: user.factorioStats.points},
      {name: "Deaths", value: user.factorioStats.deaths},
      {name: "Built Entities", value: user.factorioStats.builtEntities},
      {name: "Time played (minutes)", value: user.factorioStats.timePlayed/54000*15}
    )
    message.channel.send(embed)
  }

}

module.exports = Linkme;