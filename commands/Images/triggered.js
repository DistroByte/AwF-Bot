const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Triggered extends Command {
  constructor(client) {
    super(client, {
      name: "triggered",
      description: "Generates a \"triggered\" image using Nekobot API",
      usage: "(@member)",
      examples: ["{{p}}triggered", "{{p}}triggered @DistroByte#0001"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args) {

    const user = await this.client.resolveUser(args[0]) || message.author;
    const m = await message.channel.send("Please wait...")
    const buffer = await this.client.AmeAPI.generate("triggered", { url: user.displayAvatarURL({ format: "png", size: 512 }), sepia: "true", invert: "true" });
    const attachment = new Discord.MessageAttachment(buffer, "triggered.gif");
    m.delete();
    message.channel.send(attachment);
  }
}

module.exports = Triggered;