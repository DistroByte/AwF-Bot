const Command = require("../../base/Command.js");

class Unmute extends Command {

  constructor(client) {
    super(client, {
      name: "unmute",
      description: "Unmute the mentioned member!",
      usage: "[@member]",
      examples: ["{{p}}unmute @DistroByte#0001"],
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

  async run(message, args) {

    const member = await this.client.resolveMember(args[0], message.guild);
    if (!member) {
      return message.channel.send("Please specify the member you want to unmute!");
    }

    const memberPosition = member.roles.highest.position;
    const moderationPosition = message.member.roles.highest.position;
    if (message.member.ownerID !== message.author.id && !(moderationPosition > memberPosition)) {
      return message.channel.send("You can't unmute or update a unmute for a member who has an higher or equal role hierarchy to yours!");
    }

    const memberData = await this.client.findOrCreateMember({ id: member.id, guildID: message.guild.id });

    if (memberData.mute.muted) {
      memberData.mute.endDate = Date.now();
      memberData.markModified("mute");
      memberData.save();
      message.channel.send(`**${member.user.tag}** has just been unmuted!`);
    } else {
      message.channel.send(`**${member.user.tag}** is not muted on this server!`);
    }
  }
}

module.exports = Unmute;