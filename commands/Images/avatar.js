const Discord = require("discord.js");
const Command = require("../../base/Command");

class Avatar extends Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      description: "Fetches your avatar!",
      usage: "(@user)",
      examples: ['{{p}}avatar', '{{p}}avatar @user1 @user2'],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ['icon'],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false
    })
  }

  async run(message, args, data) {
    let user = await this.client.resolveUser(args[0]);
    if (!user) user = message.author;
    const avatarURL = user.displayAvatarURL({ size: 512, dynamic: true }).replace(".webp", ".png");
    if (message.content.includes("-v")) message.channel.send("<" + avatarURL + ">");
    const attachment = new Discord.MessageAttachment(avatarURL, `avatar.${avatarURL.split(".").pop().split("?")[0]}`);
    message.channel.send(attachment);
  }
}

module.exports = Avatar;