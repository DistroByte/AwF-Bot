const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Kick extends Command {

  constructor(client) {
    super(client, {
      name: "kick",
      description: "Kick the mentioned member!",
      usage: "[@member] (reason)",
      examples: ["{{p}}kick @DistroByte#0001 Spam"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: ["KICK_MEMBERS"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "KICK_MEMBERS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const member = await this.client.resolveMember(args[0], message.guild);
    if (!member) {
      return message.channel.send("Please specify a valid member to kick!");
    }

    if (member.id === message.author.id) {
      return message.channel.send("You can't kick yourself!");
    }

    const memberData = await this.client.findOrCreateMember({ id: member.id, guildID: message.guild.id });

    // Gets the kick reason
    let reason = args.slice(1).join(" ");
    if (!reason) {
      reason = "No reason provided";
    }

    const memberPosition = member.roles.highest.position;
    const moderationPosition = message.member.roles.highest.position;
    if (message.member.ownerID !== message.author.id && !(moderationPosition > memberPosition)) {
      return message.channel.send("You can't kick or update a kick for a member who has an higher or equal role hierarchy to yours!");
    }

    if (!member.kickable) {
      return message.channel.send("An error has occurred... Please check that I have the permission to ban this specific member and try again!");
    }

    await member.send(`Hello ${member.user.tag},\nYou have just been kicked from **${message.guild.name}** by **${message.author.tag}** because of **${reason}**!`).catch(() => { });

    // Kick the user
    member.kick(reason).then(() => {

      // Send a success message in the current channel
      message.channel.send(`**${member.user.tag}** has just been kicked from **${message.guild.name}** by **${message.author.tag}** because of **${reason}**!`);

      data.guild.casesCount++;
      data.guild.save();

      const caseInfo = {
        channel: message.channel.id,
        moderator: message.author.id,
        date: Date.now(),
        type: "kick",
        case: data.guild.casesCount,
        reason,
      };

      memberData.sanctions.push(caseInfo);
      memberData.save();

      if (data.guild.plugins.modlogs) {
        const channel = message.guild.channels.cache.get(data.guild.plugins.modlogs);
        if (!channel) return;
        const embed = new Discord.MessageEmbed()
          .setAuthor(`Kick | Case #${data.guild.casesCount}`)
          .addField("User", `\`${member.user.tag}\` (${member.user.toString()})`, true)
          .addField("Moderation", `\`${message.author.tag}\` (${message.author.toString()})`, true)
          .addField("Reason", reason, true)
          .setColor("#e88709");
        channel.send(embed);
      }

    }).catch(() => {
      return message.channel.send("An error has occurred... Please check that I have the permission to kick this specific member and try again!");
    });
  }
}

module.exports = Kick;
