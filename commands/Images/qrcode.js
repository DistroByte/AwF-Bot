const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Qrcode extends Command {

  constructor(client) {
    super(client, {
      name: "qrcode",
      description: "Generates a QR code image from a given text",
      usage: "[text]",
      examples: ["{{p}}qrcode Hello"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["qr"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const text = args.join(" ");
    if (!text) {
      return message.channel.send("Please specify the QR code source text!")
    }

    const pleaseWait = await message.channel.send("Please wait...")

    const embed = new Discord.MessageEmbed()
      .setImage(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(new RegExp(" ", "g"), "%20")}`)
      .setColor(data.config.embed.color);

    pleaseWait.edit("Here's your QR code", { embed });

  }

}

module.exports = Qrcode;