const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Invitations extends Command {

  constructor(client) {
    super(client, {
      name: "invitations",
      description: "Shows the number of people you have invited to the server!",
      usage: "(@member)",
      examples: ["{{p}}invitations", "{{p}}invitations @DistroByte#0001"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_GUILD"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    let member = await this.client.resolveMember(args[0], message.guild);
    if (!member) member = message.member;

    // Gets the invites
    const invites = await message.guild.fetchInvites().catch(() => { });
    if (!invites) return message.channel.send("Something went wrong...Please retry again later!");

    const memberInvites = invites.filter((i) => i.inviter && i.inviter.id === member.user.id);

    if (memberInvites.size <= 0) {
      if (member === message.member) {
        return message.channel.send("You haven't invited anyone to the server!");
      } else {
        return message.channel.send(`${member.user.tag} didn't invite anyone to the server!`);
      }
    }

    const content = memberInvites.map((i) => {
      return `**${i.code}** (${i.uses} uses) | ${i.channel.toString()}`;
    }).join("\n");
    let index = 0;
    memberInvites.forEach((invite) => index += invite.uses);

    const embed = new Discord.MessageEmbed()
      .setColor(data.config.embed.color)
      .setFooter(data.config.embed.footer)
      .setAuthor("Invites Tracker")
      .setDescription(`Information about the invitations of ${member.user.tag} on ${message.guild.name}`)
      .addField("Invited Members", `${index} members`)
      .addField("Codes", content);

    message.channel.send(embed);
  }
}

module.exports = Invitations;
