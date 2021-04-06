const Command = require("../../base/Command.js"),
  Discord = require("discord.js"),
  fetch = require("node-fetch");

class Tweet extends Command {

  constructor(client) {
    super(client, {
      name: "tweet",
      description: "Generates a \"tweet\" image using Nekobot API",
      usage: "[@twitter_username] [content]",
      examples: ["{{p}}tweet @ElonMusk Hello"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["twitter"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args) {
    const user = args[0];
    const text = args.slice(1).join(" ");

    if (!user) {
      return message.channel.send("Please include a twitter handle");
    }

    if (!text) {
      return message.channel.send("Please add some tweet content!");
    }

    const m = await message.channel.send("Please wait...")

    try {
      const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=tweet&username=${user}&text=${text}`));
      const json = await res.json();
      const attachment = new Discord.MessageAttachment(json.message, "tweet.png");
      m.delete();
      message.channel.send(attachment);
    } catch (e) {
      console.log(e);
      message.channel.send(`Error occured: ${e}`)
    }

  }

}

module.exports = Tweet;