const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Suggest extends Command {

  constructor(client) {
    super(client, {
      name: "suggest",
      description: "Send your suggestion to the defined channel!",
      usage: "[message]",
      examples: ["{{p}}suggest New channel #offtopic please"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["suggestion", "sugg"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args, data) {

    const suggChannel = message.guild.channels.cache.get(data.guild.plugins.suggestions);
    if (!suggChannel) {
      return message.channel.send("No suggestion channel defined!");
    }

    const sugg = args.join(" ");
    if (!sugg) {
      return message.channel.send("Please enter a suggestion!");
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor(`Suggestion - ${message.author.username}`, message.author.displayAvatarURL())
      .addField("Author", `\`${message.author.username}#${message.author.discriminator}\``, true)
      .addField("Date", this.client.printDate(new Date(Date.now())), true)
      .addField("Content", "**" + sugg + "**")
      .setColor(data.config.embed.color)
      .setFooter(data.config.embed.footer);

    const success = Discord.Util.parseEmoji(this.client.emotes?.success).id;
    const error = Discord.Util.parseEmoji(this.client.emotes?.error).id;

    suggChannel.send(embed).then(async (m) => {
      await m.react(success);
      await m.react(error);
    });

    message.channel.send(`Your suggestion is being voted in ${suggChannel.toString()}`);
  }
}

module.exports = Suggest;