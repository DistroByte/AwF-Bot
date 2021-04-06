const Command = require("../../base/Command"),
  { Util } = require('discord.js');

class XP extends Command {
  constructor(client) {
    super(client, {
      name: "xp",
      description: "Allows modification of xp for a user",
      usage: "[add/set/remove] [@member] [number]",
      examples: ["{{p}}xp add @DistroByte#0001 1000", "{{p}}xp set @DistroByte#0001 0", "{{p}}xp remove @DistroByte#0001 1000"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: true,
      args: true,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    if (!args[1]) return message.channel.send("Please specify a user!")
    if (!args[2]) return message.channel.send("Please specify amount of xp to add!")
    let user = data.guild.members.find(u => u.id === message.mentions.members.first().id)
    if (args[0] === "add") {
      const xp = user.xp;

      const newXp = Number(xp) + Number(args[2]);

      user.xp = newXp;
      user.markModified("xp")
      await user.save();
      await data.guild.save()

      const success = Util.parseEmoji(this.client.emotes?.success).id
      return message.react(success)
    }

    if (args[0] === "remove") {
      const xp = user.xp;

      const newXp = Number(xp) - Number(args[2]);

      user.xp = newXp;
      user.markModified("xp")
      await user.save();
      await data.guild.save()

      const success = Util.parseEmoji(this.client.emotes?.success).id
      return message.react(success)
    }

    if (args[0] === "set") {

      const newXp = Number(args[2]);

      user.xp = newXp;
      user.markModified("xp")
      await user.save();
      await data.guild.save()

      const success = Util.parseEmoji(this.client.emotes?.success).id
      return message.react(success)
    }
  }
}

module.exports = XP;