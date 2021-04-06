const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Report extends Command {

  constructor(client) {
    super(client, {
      name: "report",
      description: "Report a user to the moderation team!",
      usage: '[@user] [reason]',
      examples: ['{{p}}report @DistroByt#0001 Breaking the rules'],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args, data) {

    const repChannel = message.guild.channels.cache.get(data.guild.plugins.reports);
    if (!repChannel) {
      return message.channel.send('No report channel set!');
    }

    const member = await this.client.resolveMember(args[0], message.guild);
    if (!member) {
      return message.channel.send('Please mention the user you want report!');
    }

    if (member.id === message.author.id) {
      return message.channel.send('You can\'t report yourself');
    }

    const rep = args.slice(1).join(" ");
    if (!rep) {
      return message.channel.send('Please enter a report reason!');
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor(`Report - ${member.user.tag}`, message.author.displayAvatarURL())
      .addField("Author", message.author.tag, true)
      .addField("Date", this.client.printDate(new Date(Date.now())), true)
      .addField("Reason", "**" + rep + "**")
      .addField("User", `\`${member.user.tag}\` (${member.user.toString()})`, true)
      .setColor(data.config.embed.color)
      .setFooter(data.config.embed.footer);

    const success = Discord.Util.parseEmoji(this.client.emotes?.success).id;
    const error = Discord.Util.parseEmoji(this.client.emotes?.error).id;

    repChannel.send(embed).then(async (m) => {
      await m.react(success);
      await m.react(error);
    });

    message.channel.send(`Your report has been sent in ${repChannel.toString()}!`);
  }

}

module.exports = Report;
