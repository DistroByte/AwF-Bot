const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Ban extends Command {

  constructor(client) {
    super(client, {
      name: "ban",
      description: "Ban the mentioned member!",
      usage: "[@user] (reason)",
      examples: ["{{p}}ban @DistroByte#0001 Spam"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: ["BAN_MEMBERS"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "BAN_MEMBERS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const user = await this.client.resolveUser(args[0]);
    if (!user) {
      return message.channel.send("Please specify a valid member to ban!")
    }

    const memberData = message.guild.members.cache.get(user.id) ? await this.client.findOrCreateMember({ id: user.id, guildID: message.guild.id }) : null;

    if (user.id === message.author.id) {
      return message.channel.send("You can't ban yourself!");
    }

    // If the user is already banned
    const banned = await message.guild.fetchBans();
    if (banned.some((m) => m.user.id === user.id)) {
      return message.channel.send(`${user.tag} is already banned!`)
    }

    // Gets the ban reason
    let reason = args.slice(1).join(" ");
    if (!reason) {
      reason = "No reason provided";
    }

    const member = await message.guild.members.fetch(user.id).catch(() => { });
    if (member) {
      const memberPosition = member.roles.highest.position;
      const moderationPosition = message.member.roles.highest.position;
      if (message.member.ownerID !== message.author.id && !(moderationPosition > memberPosition)) {
        return message.channel.send("You can't ban or update a ban for a member who has an higher or equal role hierarchy to yours!");
      }
      if (!member.bannable) {
        return message.channel.send("An error has occurred... Please check that I have the permission to ban this specific member and try again!");
      }
    }

    await user.send(`Hello ${user.tag},\nYou have just been banned from **${message.guild.name}** by **${message.author.tag}** because of **${reason}**!`).catch(() => { });

    // Ban the user
    message.guild.members.ban(user, { reason }).then(() => {

      // Send a success message in the current channel
      message.channel.send(`**${user.tag}** has just been banned from **${message.guild.name}** by **${message.author.tag}** because of **${reason}**!`);

      const caseInfo = {
        channel: message.channel.id,
        moderator: message.author.id,
        date: Date.now(),
        type: "ban",
        case: data.guild.casesCount,
        reason
      };

      if (memberData) {
        memberData.sanctions.push(caseInfo);
        memberData.save();
      }

      data.guild.casesCount++;
      data.guild.save();

      if (data.guild.plugins.modlogs) {
        const channel = message.guild.channels.cache.get(data.guild.plugins.modlogs);
        if (!channel) return;
        const embed = new Discord.MessageEmbed()
          .setAuthor(`Ban | Case #${data.guild.casesCount}`)
          .addField("User", `\`${user.tag}\` (${user.toString()})`, true)
          .addField("Moderator", `\`${message.author.tag}\` (${message.author.toString()})`, true)
          .addField("Reason", reason, true)
          .setColor("#e02316");
        channel.send(embed);
      }

    }).catch((err) => {
      console.log(err);
      return message.channel.send("An error has occurred... Please check that I have the permission to ban this specific member and try again!");
    });
  }
}

module.exports = Ban;
