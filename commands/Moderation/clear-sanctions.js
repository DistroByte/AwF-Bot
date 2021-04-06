const Command = require("../../base/Command.js");

class Clearsanctions extends Command {

  constructor(client) {
    super(client, {
      name: "clear-sanctions",
      description: "Clear a member sanctions!",
      usage: "[@member]",
      examples: ["{{prefix}}clear-sanctions @DistroByte#0001"],
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

  async run(message, args) {

    const member = await this.client.resolveMember(args[0], message.guild);
    if (!member) {
      return message.channel.send("Please mention the member you wish to remove the sanctions from!");
    }
    const memberData = await this.client.findOrCreateMember({ id: member.id, guildID: message.guild.id });
    memberData.sanctions = [];
    memberData.save();
    message.channel.send(`${member.user.tag}'s sanctions were removed!`)
  }

}

module.exports = Clearsanctions;