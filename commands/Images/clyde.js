const Command = require("../../base/Command.js"),
  Discord = require("discord.js"),
  fetch = require("node-fetch");

class Clyde extends Command {
  constructor(client) {
    super(client, {
      name: "clyde",
      description: "Generates a \"Clyde\" message image using the Nekobot API",
      usage: "[text]",
      examples: ["{{p}}clyde Discord will close on December 11, 2002. Goodbye."],
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
    const text = args.join(" ");

    if (!text) {
      return message.channel.send("Please specify the message text!");
    }

    try {
      const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=clyde&text=${text}`));
      const json = await res.json();
      const attachment = new Discord.MessageAttachment(json.message, "clyde.png");
      message.channel.send(attachment);
    } catch (e) {
      console.log(e);
      message.channel.send(`Error occured: ${e}`)
    }
  }
}

module.exports = Clyde;