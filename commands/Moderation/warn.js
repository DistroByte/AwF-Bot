const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Warn extends Command {

  constructor(client) {
    super(client, {
      name: "warn",
      description: "Warn a member in private messages",
      usage: "[@member] [reason]",
      examples: ["{{p}}warn @DistroByte#0001 Dumb"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: ["MANAGE_MESSAGES"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const member = await this.client.resolveMember(args[0], message.guild);
    if (!member) {
      return message.channel.send("Please specify the member you want to warn!");
    }
    if (member.user.bot) {
      return message.channel.send("This user is a bot!");
    }
    const memberData = await this.client.findOrCreateMember({ id: member.id, guildID: message.guild.id });

    if (member.id === message.author.id) {
      return message.channel.send("You can't warn yourself!")
    }

    const memberPosition = member.roles.highest.position;
    const moderationPosition = message.member.roles.highest.position;
    if (message.member.ownerID !== message.author.id && !(moderationPosition > memberPosition)) {
      return message.channel.send("You can't warn or update a warn for a member who has an higher or equal role hierarchy to yours!");
    }

    const reason = args.slice(1).join(" ");
    if (!reason) {
      return message.channel.send("Please enter a reason!");
    }

    // Gets current member sanctions
    const sanctions = memberData.sanctions.filter((s) => s.type === "warn").length;
    const banCount = data.guild.plugins.warnsSanctions.ban;
    const kickCount = data.guild.plugins.warnsSanctions.kick;

    data.guild.casesCount++;
    data.guild.save();

    const caseInfo = {
      channel: message.channel.id,
      moderator: message.author.id,
      date: Date.now(),
      type: "warn",
      case: data.guild.casesCount,
      reason
    };

    const embed = new Discord.MessageEmbed()
      .addField("User", `\`${member.user.tag}\` (${member.user.toString()})`)
      .addField("Moderator", `\`${message.author.tag}\` (${message.author.toString()}`)
      .addField("Reason", reason, true);

    if (banCount) {
      if (sanctions >= banCount) {
        member.send(`Hello ${member.user},\nYou've just been warned on **${message.guild.name}** by **${message.author.tag}** for **${reason}**!`);
        caseInfo.type = "ban";
        embed.setAuthor(`Warn | Case #${data.guild.casesCount}`)
          .setColor("#e02316");
        message.guild.members.ban(member).catch(() => { });
        message.channel.send(`**${member.user.tag}** was automatically banned because they reach more than **${banCount}** warns!`);
      }
    }

    if (kickCount) {
      if (sanctions >= kickCount) {
        member.send(`Hello ${member.user},\nYou have just been kicked from **${message.guild.name}** by **${message.author.tag}** because of **${reason}**!`);
        caseInfo.type = "kick";
        embed.setAuthor(`Kick | Case #${data.guild.casesCount}`)
          .setColor("#e88709");
        member.kick().catch(() => { });
        message.channel.send(`**${member.user.tag}** was automatically kicked because they reach more than **${banCount}** warns!`);
      }
    }

    member.send(`Hello ${member.user.tag},\nYou've just been warned on **${message.guild.name}** by **${message.author.tag}** for **${reason}**!`);
    caseInfo.type = "warn";
    embed.setAuthor(`Warn | Case #${data.guild.casesCount}`)
      .setColor("#8c14e2");
    message.channel.send(`**${member.user.tag}** has been warned in private messages for **${reason}**!`);

    memberData.sanctions.push(caseInfo);
    memberData.save();

    if (data.guild.plugins.modlogs) {
      const channel = message.guild.channels.cache.get(data.guild.plugins.modlogs);
      if (!channel) return;
      channel.send(embed);
    }
  }
}

module.exports = Warn;
