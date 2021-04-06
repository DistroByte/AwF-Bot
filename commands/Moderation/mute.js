const Command = require("../../base/Command.js"),
  Discord = require("discord.js"),
  ms = require("ms");

class Mute extends Command {

  constructor(client) {
    super(client, {
      name: "mute",
      description: "Prevents a member from sending messages and connecting to a voice chat room for a defined period of time!",
      usage: "[@member] [time]",
      examples: ["{{p}}mute @DistroByte#0001 Spam"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: ["MANAGE_MESSAGES"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_CHANNELS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const member = await this.client.resolveMember(args[0], message.guild);
    if (!member) {
      return message.channel.send("Please specify a valid member to mute!");
    }

    if (member.id === message.author.id) {
      return message.channel.send("You can't mute yourself!");
    }

    const memberPosition = member.roles.highest.position;
    const moderationPosition = message.member.roles.highest.position;
    if (message.member.ownerID !== message.author.id && !(moderationPosition > memberPosition)) {
      return message.channel.send("You can't kick or update a kick for a member who has an higher or equal role hierarchy to yours!");
    }

    const memberData = await this.client.findOrCreateMember({ id: member.id, guildID: message.guild.id });

    const time = args[1];
    if (!time || isNaN(ms(time))) {
      return message.channel.send("You must enter a valid time! Available units: `s`, `m`, `h` or `d`");
    }

    let reason = args.slice(2).join(" ");
    if (!reason) {
      reason = "No reason provided";
    }

    message.guild.channels.cache.forEach((channel) => {
      channel.updateOverwrite(member.id, {
        SEND_MESSAGES: false,
        ADD_REACTIONS: false,
        CONNECT: false
      }).catch(() => { });
    });

    member.send(`Hello ${member.user.username},\nYou've just been muted on **${message.guild.name}** by **${message.author.tag}** for **${time}** because of **${reason}**!`);

    message.channel.send(`**${member.user.tag}** is now muted for **${message.guild.name}** because of **${reason}**!`);

    data.guild.casesCount++;

    const caseInfo = {
      channel: message.channel.id,
      moderator: message.author.id,
      date: Date.now(),
      type: "mute",
      case: data.guild.casesCount,
      reason,
      time
    };

    memberData.mute.muted = true;
    memberData.mute.endDate = Date.now() + ms(time);
    memberData.mute.case = data.guild.casesCount;
    memberData.sanctions.push(caseInfo);

    memberData.markModified("sanctions");
    memberData.markModified("mute");
    await memberData.save();

    await data.guild.save();

    this.client.databaseCache.mutedUsers.set(`${member.id}${message.guild.id}`, memberData);

    if (data.guild.plugins.modlogs) {
      const channel = message.guild.channels.cache.get(data.guild.plugins.modlogs);
      if (!channel) return;
      const embed = new Discord.MessageEmbed()
        .setAuthor(`Mute | Case #${data.guild.casesCount}`)
        .addField("User", `\`${member.user.tag}\` (${member.user.toString()})`, true)
        .addField("Moderator", `\`${message.author.tag}\` (${message.author.toString()})`, true)
        .addField("Reason", reason, true)
        .addField("Duration", time, true)
        .addField("Expiry", message.printDate(new Date(Date.now() + ms(time))), true)
        .setColor("#f44271");
      channel.send(embed);
    }
  }
}

module.exports = Mute;
