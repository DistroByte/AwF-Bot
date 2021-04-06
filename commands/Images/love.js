const Command = require("../../base/Command.js"),
  Discord = require("discord.js"),
  fetch = require("node-fetch");

class Love extends Command {
  constructor(client) {
    super(client, {
      name: "love",
      description: "Generates a \"love\" image using the Nekobot API",
      usage: "[@member1] (@member2)",
      examples: ["{{p}}love @DistroByte#0001\n{{p}}love @DistroByte#0001 @ComfyBot#4093"],
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

    const users = [
      await this.client.resolveUser(args[0]) || message.author,
      await this.client.resolveUser(args[1]) || message.author
    ];

    try {
      const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=ship&user1=${users[0].displayAvatarURL({ format: "png", size: 512 })}&user2=${users[1].displayAvatarURL({ format: "png", size: 512 })}`));
      const json = await res.json();
      const attachment = new Discord.MessageAttachment(json.message, "love.png");
      message.channel.send(attachment);
    } catch (e) {
      console.log(e);
      message.channel.send(`Error occured: ${e}`)
    }

  }

}

module.exports = Love;