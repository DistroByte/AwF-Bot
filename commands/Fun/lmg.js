const Command = require("../../base/Command.js");

class Lmg extends Command {
  constructor(client) {
    super(client, {
      name: "lmg",
      description: "Generate a LMGTFY link with your search",
      usage: "[search]",
      examples: ["{{p}}lmg How to create a Discord bot?"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["lmgtfy"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 1000
    });
  }

  async run(message, args) {
    const question = args.join(" ");
    if (!question) return message.channel.send("You must specify a search!");
    const encodedQuestion = question.replace(/[' '_]/g, "+");
    await message.channel.send(`https://letmegooglethat.com/?q=${encodedQuestion}`);
    message.delete().catch(() => { });
  }
}

module.exports = Lmg;