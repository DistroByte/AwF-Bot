const Command = require("../../base/Command.js"),
  figlet = require("figlet"),
  util = require("util"),
  figletAsync = util.promisify(figlet);

class Ascii extends Command {

  constructor(client) {
    super(client, {
      name: "ascii",
      description: "Turn your text into ascii characters!",
      usage: "[text]",
      examples: ["{{p}}ascii Hello world!"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args) {
    const text = args.join(" ");
    if (!text || text.length > 20) {
      return message.channel.send("Please enter a valid text (less than 20 characters)!");
    }

    const rendered = await figletAsync(text);
    message.channel.send("```" + rendered + "```");
  }
}

module.exports = Ascii;