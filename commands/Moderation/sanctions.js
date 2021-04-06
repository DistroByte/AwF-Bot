const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Sanctions extends Command {

  constructor(client) {
    super(client, {
      name: "sanctions",
      description: "Displays the list of infractions committed by a member!",
      usage: "[@member]",
      examples: ["{{p}}sanctions [@member]"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["warns", "see-warns", "view-warns", "see-sanctions", "view-sanctions", "infractions", "view-infractions", "see-infractions"],
      memberPermissions: ["MANAGE_MESSAGES"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const user = await this.client.resolveUser(args[0]);
    if (!user) {
      return message.channel.send("You must specify a member!");
    }
    const memberData = await this.client.findOrCreateMember({ id: user.id, guildID: message.guild.id });

    const embed = new Discord.MessageEmbed()
      .setAuthor(user.tag, user.displayAvatarURL())
      .setColor(data.config.embed.color)
      .setFooter(data.config.embed.footer);

    if (memberData.sanctions.length < 1) {
      embed.setDescription(`**${user.tag}** does have any sanctions.`);
      return message.channel.send(embed);
    } else {
      memberData.sanctions.forEach((s) => {
        embed.addField(s.type + " | #" + s.case, `Moderator: <@${s.moderator}>\nReason: ${s.reason}`, true);
      });
    }

    message.channel.send(embed);
  }
}

module.exports = Sanctions;
