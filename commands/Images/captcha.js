const Command = require("../../base/Command.js"),
  Discord = require("discord.js"),
  fetch = require("node-fetch");

class Captcha extends Command {
  constructor(client) {
    super(client, {
      name: "captcha",
      description: "Generates a \"captcha\" image using the Nekobot API",
      usage: "(@member)",
      examples: ["{{p}}captcha @DistroByte#0001", "{{p}}captcha"],
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
    const m = await message.channel.send("Hang on!")
    try {
      const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=captcha&username=${user.username}&url=${user.displayAvatarURL({ format: "png", size: 512 })}`));
      const json = await res.json();
      const attachment = new Discord.MessageAttachment(json.message, "captcha.png");
      message.channel.send(attachment);
      m.delete();
    } catch (e) {
      console.log(e);
      m.channel.send("An error occured... Please try again later!")
    }

  }

}

module.exports = Captcha;