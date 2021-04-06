const Command = require("../../base/Command.js"),
  Discord = require("discord.js"),
  fetch = require("node-fetch");

class Phcomment extends Command {
  constructor(client) {
    super(client, {
      name: "phcomment",
      description: "Generates a \"phcomment\" image using Nekobot API",
      usage: "(@member) [text]",
      examples: ["{{p}}phcomment Hi!", "{{p}}phcomment @DistroByte#0001 Hi!"],
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

    let user = await this.client.resolveUser(args[0]);
    let text = args.join(" ");

    if (user) {
      text = args.slice(1).join(" ");
    } else {
      user = message.author;
    }

    if (!text) {
      return message.channel.send("Please specify some text!");
    }

    try {
      const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${user.username}&image=${user.displayAvatarURL({ format: "png", size: 512 })}&text=${text}`));
      const json = await res.json();
      const attachment = new Discord.MessageAttachment(json.message, "phcomment.png");
      message.channel.send(attachment);
    } catch (e) {
      console.log(e);
      message.channel.send(`Error occured: ${e}`)
    }

  }

}

module.exports = Phcomment;