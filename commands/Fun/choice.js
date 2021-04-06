const Command = require("../../base/Command.js");

class Choice extends Command {

  constructor(client) {
    super(client, {
      name: "choice",
      description: "Helps you choose between the given choices!",
      usage: "[choice1/choice2/etc...]",
      examples: ["{{p}}choice Fire/Wind/Water"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["random"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args) {

    // Gets the answers by spliting on "/"
    const answers = args.join(" ").split("/");
    if (answers.length < 2) return message.channel.send("You must enter more than two choices!\n(or use the `flip` command instead)");
    if (answers.some(answer => !answer))
      return message.channel.send("One of your choices seems to be empty....Please try again!");

    const m = await message.channel.send("Choice being made...");

    setTimeout(() => {
      m.channel.send("Here's my choice:")
      const result = answers[parseInt(Math.floor(Math.random() * answers.length))];
      message.channel.send("```" + result + "```");
    }, 1500);

  }

}

module.exports = Choice;