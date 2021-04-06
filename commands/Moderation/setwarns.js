const Command = require("../../base/Command.js");

class Setwarns extends Command {

  constructor(client) {
    super(client, {
      name: "setwarns",
      description: "Define the sanctions that members will get after a certain number of warns!",
      usage: "[kick/ban] [number/reset]",
      examples: ["{{p}}setwarns kick 10", "{{p}}setwarns ban 10", "{{p}}setwarns ban reset"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "BAN_MEMBERS", "KICK_MEMBERS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const sanction = args[0];
    if (!sanction || (sanction !== "kick" && sanction !== "ban")) {
      return message.channel.send("Please specify sanction between `kick` and `ban`");
    }

    const number = args[1];

    if (number === "reset") {
      if (sanction === "kick") {
        data.guild.plugins.warnsSanctions.kick = false;
        data.guild.markModified("plugins.warnsSanctions");
        data.guild.save();
        return message.channel.send(`**Members can no longer be automatically kicked!**\n\n:arrow_right_hook: *Send \`${data.guild.prefix}configuration\` to see the updated configuration!*`);
      }
      if (sanction === "ban") {
        data.guild.plugins.warnsSanctions.ban = false;
        data.guild.markModified("plugins.warnsSanctions");
        data.guild.save();
        return message.channl.send(`**Members can no longer be automatically banned!**\n\n:arrow_right_hook: *Send \`${data.guild.prefix}configuration\` to see the updated configuration!*`);
      }
    }

    if (!number || isNaN(number)) {
      return message.channel.send("Please specify a valid number!");
    }
    if (number < 1 || number > 10) {
      return message.channel.send(`Please specify a valid number between **1** and **2** !`);
    }

    if (sanction === "kick") {
      data.guild.plugins.warnsSanctions.kick = number;
      data.guild.markModified("plugins.warnsSanctions");
      data.guild.save();
      return message.channel.send(`**\`${number}\` warnings will result in a kick!**\n\n:arrow_right_hook: *Send \`${data.guild.prefix}configuration\` to see the updated configuration!*`);
    }

    if (sanction === "ban") {
      data.guild.plugins.warnsSanctions.ban = number;
      data.guild.markModified("plugins.warnsSanctions");
      data.guild.save();
      return message.channel.send(`**\`${number}\` warnings will result in a ban!**\n\n:arrow_right_hook: *Send \`${data.guild.prefix}configuration\` to see the updated configuration!*`);;
    }
  }
}

module.exports = Setwarns;