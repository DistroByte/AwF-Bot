const Command = require("../../base/Command.js");

class Eightball extends Command {
  constructor(client) {
    super(client, {
      name: "8ball",
      description: "I'm telling you the truth!",
      usage: "[question]",
      examples: ["{{p}}8ball Is Comfy the best Discord bot?"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["eight-ball", "eightball"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args) {

    if (!args[0] || !message.content.endsWith("?")) {
      return message.channel.send("You must enter a question!");
    }

    const options = ["I'm sure of it.", "it's definitely safe.", "yes, definitely.", "better not tell you now.",
      "ask again later.", "don't count on it.", "I don't think.", "my sources say no.", "no.", "outlook not so good."
    ]

    const answerNO = parseInt(Math.floor(Math.random() * 10), 10) + 1;

    message.channel.send(`${message.author.username}, ${options[answerNO]}`);
  }

}

module.exports = Eightball;